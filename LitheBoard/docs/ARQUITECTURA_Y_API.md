# Arquitectura y contrato de la API

Documento de referencia del estado actual de LitheBoard-IOT. Describe cómo se
comunican el frontend, el backend y los servicios de datos, además de las rutas
HTTP y sus formatos de respuesta. Los contratos se verificaron contra el código
en `frontend/src`, `backend/routes`, `backend/controllers` y
`backend/schemas`.


> Contratos canónicos desde las fases 5 y 6: rutas plurales, campos y enums
> en `snake_case`, JSON nativo y eventos `historic:created` /
> `entity:connection_changed`. Los aliases anteriores fueron retirados.
> Ver `MIGRACION_FASES_5_6.md` antes de actualizar otra base.

## 1. Vista general

```text
Navegador
  ├─ React ───────── HTTP/JSON + JWT ───────────┐
  └─ Socket.IO ───── eventos en tiempo real ────┤
                                                  v
                                         Backend Express
                                          ├─ REST API
                                          ├─ Socket.IO
                                          ├─ DatasourceController
                                          │    ├─ MQTT / EMQX
                                          │    └─ Polling de APIs externas
                                          ├─ Rulechain engine y alarmas
                                          └─ Servicios y modelos MySQL
```

### Componentes

- **Frontend:** aplicación React en `frontend/`. Las vistas y flujos están en
  `frontend/src/features/`; `frontend/src/services/api.js` crea el cliente
  Axios y añade el JWT a las peticiones; `frontend/src/socket.js` crea la
  conexión Socket.IO.
- **Backend:** aplicación Express en `backend/server.js`. Las rutas se montan
  bajo `/api`; los controladores coordinan validación, autorización y servicios.
- **MySQL:** persiste clientes, entidades, dashboards, widgets, históricos,
  alarmas, notificaciones y rulechains.
- **EMQX:** broker MQTT. El backend se conecta al broker y administra las
  suscripciones de las entidades MQTT.
- **Datasources:** `DatasourceController` carga las entidades existentes al
  inicializar el backend y activa el handler MQTT o el polling HTTP según el
  tipo configurado. Los datos recibidos se procesan con las rulechains y las
  alarmas, y pueden generar eventos Socket.IO.

Los servicios se definen en `docker-compose.yml`. El frontend usa por defecto
los valores de `frontend/src/config/config.json`; el backend lee su
configuración de variables de entorno y `.env`. Los puertos configurados en el
proyecto son frontend `3000`, API HTTP `3001` y Socket.IO `3007`; MySQL y MQTT
usan sus puertos de servicio habituales. Confirmar la configuración local antes
de desplegar.

> **Configuración sensible:** no guardar contraseñas, tokens, secretos JWT ni
> credenciales del broker en esta documentación. Gestionarlos mediante
> variables de entorno o un gestor de secretos y cambiar cualquier valor de
> ejemplo que se haya publicado antes de usarlo en un entorno real.

## 2. Flujo de datos

1. El usuario inicia sesión con email y contraseña. Los endpoints OTP están
   disponibles por separado; la pantalla actual de login no los invoca.
2. El frontend conserva el JWT y lo envía en el encabezado
   `Authorization: Bearer <token>` mediante el cliente Axios.
3. Las rutas protegidas validan el JWT con `protect`. Las operaciones de
   administración pueden exigir además un rol con `restrictTo`.
4. Los handlers reciben telemetría MQTT o consultan una API externa de acuerdo
   con la configuración de cada entidad.
5. `DatasourceController` procesa cada mensaje: ejecuta la rulechain asociada,
   evalúa alarmas y notifica cambios al cliente por Socket.IO.
6. El frontend obtiene los históricos por REST y actualiza la interfaz ante
   eventos en tiempo real.

## 3. Autenticación, autorización y validación

- Las rutas protegidas requieren un JWT firmado por el backend. El frontend lo
  guarda en `localStorage` como `token` y el interceptor de Axios lo agrega a
  cada solicitud realizada mediante `api`.
- El login está en `POST /api/clients/login`. OTP se solicita en
  `POST /api/otp/request` y se verifica en `POST /api/otp/verify`, por separado.
- La autenticación y el OTP no son equivalentes: el OTP se verifica enviando
  `client_id` y un código de seis dígitos. La ruta de verificación OTP no lleva
  el middleware `protect` en el código actual.
- `assertOwnership` valida acceso a recursos asociados al usuario. Los
  clientes vinculados pueden acceder a recursos de su administrador según
  `backend/utils/authorization.js`. La asociación de dashboards compartidos
  requiere considerar también `shared_client_ids`.
- `validateSchema` aplica esquemas Joi, elimina propiedades desconocidas y
  responde con error HTTP 400 cuando la entrada no es válida.
- Los errores procesados por el handler global usan el envoltorio de la
  sección 6. Los códigos de autenticación/autorización habituales
  son 401 y 403; también pueden aparecer 404 y 500.
- Los permisos exactos dependen de cada ruta. En particular, el middleware de
  roles mapea los niveles 1, 2 y 3 a `admin`, `client` y `manager`.

## 4. Convenciones de respuesta

Todas las respuestas usan el mismo envoltorio, definido en
`backend/utils/response.js` y descrito en `docs/CONVENCIONES_Y_CONTRATOS.md` §5.
Los controladores no llaman a `res.json()` directamente; una regla de ESLint lo
impide.

Colección (siempre `200`, también cuando está vacía):

```json
{
  "status": "success",
  "data": { "entities": [] },
  "meta": { "count": 0 },
  "error": null
}
```

Recurso individual (lectura, creación con `201` o actualización):

```json
{
  "status": "success",
  "data": {
    "entity": {
      "entity_id": 42,
      "client_id": 7,
      "name": "Sensor",
      "datasource_type": "mqtt",
      "datasource_config": {}
    }
  },
  "error": null
}
```

Reglas:

- La clave de `data` es el nombre del recurso: singular para uno, plural para
  una colección.
- Las actualizaciones devuelven el recurso completo y actualizado, no un
  `message`.
- Los borrados y las acciones sin recurso resultante responden `204` sin cuerpo.
- No hay campos sueltos en la raíz (`token`, `results` o `message` ya no existen).

## 5. Endpoints HTTP

Base local de la API: `http://localhost:3001`. Salvo donde se indique
**Pública**, enviar `Authorization: Bearer <token>`.

### Autenticación y clientes

| Método y ruta | Acceso | Entrada principal | Respuesta de éxito |
|---|---|---|---|
| `POST /api/clients/login` | Pública | `{ "email": "...", "password": "..." }` | `200`; `data.session` con `token` y `client`. |
| `GET /api/clients/session` | JWT | — | `200`; `data.client` con `client_id`, `email`, `name` y `role`. |
| `POST /api/clients/logout` | JWT | — | `204`. El cliente también debe borrar el token local. |
| `POST /api/clients/register` | Pública | `name`, `email`, `password`, `role`; `admin_email` opcional | `201`; `data.client`. No inicia sesión ni devuelve JWT. |
| `PUT /api/clients` | JWT | `{ "client_id": 7, "name": "...", "email": "..." }` | `200`; `data.client` actualizado. |
| `GET /api/clients/admins/:admin_client_id/clients` | JWT, admin | `admin_client_id` en ruta | `200`; `data.client_ids`. |
| `GET /api/clients/:clients_ids` | JWT, admin | IDs separados por comas, por ejemplo `7,8` | `200`; `data.clients`. |
| `DELETE /api/clients/:client_id` | JWT, admin | `client_id` en ruta | `204`. `409 CLIENT_HAS_DEPENDENCIES` si tiene dashboards. |

El JWT y el cliente público contienen únicamente `client_id`. Las sesiones
antiguas que no lo contienen deben volver a iniciar sesión.

### OTP

| Método y ruta | Acceso | Entrada principal | Respuesta de éxito |
|---|---|---|---|
| `POST /api/otp/request` | Pública | `{ "email": "persona@example.com" }` | `204`. El código se envía por correo. |
| `POST /api/otp/verify` | Sin `protect` actualmente | `{ "client_id": 7, "otp": "123456" }` | `204`. `400 OTP_INVALID` si no coincide o venció. |

### Entidades

| Método y ruta | Acceso | Entrada principal | Respuesta de éxito |
|---|---|---|---|
| `GET /api/entities?client_id=:id` | JWT | `client_id` en query | `200`; `data.entities`. |
| `GET /api/entities/:entity_id` | JWT | ID en ruta | `200`; `data.entity`. |
| `POST /api/entities` | JWT, admin/manager | Campos de entidad indicados abajo | `201`; `data.entity`, incluyendo el ID generado. |
| `PUT /api/entities` | JWT, admin | `{ "entity_id", "name", "datasource_config", "rulechain_id" }` | `200`; `data.entity` actualizado. |
| `PATCH /api/entities/:entity_id/rulechain` | JWT, admin | `{ "rulechain": {} }` | `200`; `data.entity` actualizado. |
| `DELETE /api/entities/:entity_id` | JWT, admin | ID en ruta | `204`. |

Ejemplo MQTT para crear una entidad:

```json
{
  "client_id": 7,
  "name": "Sensor de sala",
  "datasource_type": "mqtt",
  "datasource_config": {
    "sub_topic": "temperatura",
    "pub_topic": "comando",
    "data_key": "valor"
  },
  "rulechain_id": 0
}
```

Para `datasource_type: "API"`, `datasource_config` requiere `base_url` y
`method` (`GET`, `POST`, `PUT` o `DELETE`). Acepta además `polling_interval_ms`,
`query_params`, `headers`, `request_body` y `data_key`; los tres campos JSON
opcionales deben enviarse como objetos, no como cadenas JSON. `rulechain_id` es
numérico: si la entidad no tiene rulechain, se omite.

### Dashboards y widgets

| Método y ruta | Acceso | Entrada principal | Respuesta de éxito |
|---|---|---|---|
| `GET /api/dashboards/:client_id` | JWT | ID en ruta | `200`; `data.dashboards`. |
| `POST /api/dashboards` | JWT, admin | `{ "name", "description", "client_id", "shared_client_ids" }` | `201`; `data.dashboard`. El ID lo genera el backend. |
| `PUT /api/dashboards` | JWT, admin | `{ "dashboard_id", "name", "description", "shared_client_ids" }` | `200`; `data.dashboard` actualizado. |
| `DELETE /api/dashboards/:dashboard_id` | JWT, admin | ID en ruta | `204`. Elimina también los widgets asociados. |
| `POST /api/dashboards/assign` | JWT, admin | `{ "client_id", "dashboard_id" }` | `200`; `data.dashboard`. Idempotente: si ya estaba asignado responde igual. |
| `GET /api/widgets/:client_id/:dashboard_id` | JWT | IDs en ruta | `200`; `data.widgets`. |
| `GET /api/widgets/:widget_id` | JWT | ID en ruta | `200`; `data.widget`. |
| `GET /api/widgets` | JWT | — | `200`; `data.widgets` del usuario autenticado. |
| `POST /api/widgets` | JWT, admin | `{ "name", "entity_id", "dashboard_id", "widget_type", "widget_config", "client_id" }` | `201`; `data.widget`. |
| `PUT /api/widgets/:widget_id` | JWT, admin | Campos editables del widget | `200`; `data.widget` actualizado. |
| `DELETE /api/widgets/:widget_id` | JWT, admin | ID en ruta | `204`. |

`widget_config` debe ser un objeto JSON; sus propiedades dependen del tipo de
widget (por ejemplo, `data_key`, opciones de switch, color o configuración
del mapa).

### Históricos

| Método y ruta | Acceso | Entrada principal | Respuesta de éxito |
|---|---|---|---|
| `GET /api/historics/entity/:entity_id` | JWT | ID en ruta | `200`; `data.historics`. |
| `GET /api/historics/client/:client_id` | JWT | ID en ruta | `200`; `data.historics`. |
| `POST /api/historics` | JWT, admin | `{ "entity_id", "recorded_at", "data", "client_id", "data_key" }` | `204`. `data` admite cualquier valor JSON. |

### Alarmas y notificaciones

| Método y ruta | Acceso | Entrada principal | Respuesta de éxito |
|---|---|---|---|
| `GET /api/alarms/:client_id` | JWT | ID en ruta | `200`; `data.alarms`. |
| `POST /api/alarms` | JWT | `{ "entity_id", "threshold", "client_id", "data_key", "operator" }` | `201`; `data.alarm`. `operator` admite `greater_than` o `less_than`. |
| `GET /api/notifications/:client_id` | JWT | ID en ruta | `200`; `data.notifications`. |
| `POST /api/notifications` | JWT, admin | `{ "alarm_id", "client_id", "created_at", "value" }` | `201`; `data.notification`. |
| `PATCH /api/notifications/:notification_id/read` | JWT | ID en ruta | `200`; `data.notification` actualizada. |

### Rulechains

| Método y ruta | Acceso | Entrada principal | Respuesta de éxito |
|---|---|---|---|
| `GET /api/rulechains?client_id=:id` | JWT | `client_id` en query | `200`; `data.rulechains`. |
| `GET /api/rulechains/:rulechain_id` | JWT | ID en ruta | `200`; `data.rulechain`. |
| `POST /api/rulechains` | JWT, admin | `client_id`, `name`, `description`, `definition` (`nodes`, `edges`) y `entity_ids` opcional | `201`; `data.rulechain`. |
| `PUT /api/rulechains` | JWT, admin | `rulechain_id`, `definition` y campos editables | `200`; `data.rulechain` actualizada. |
| `DELETE /api/rulechains/:rulechain_id` | JWT, admin | ID en ruta | `204`. |

### Publicación MQTT

| Método y ruta | Acceso | Entrada principal | Respuesta de éxito |
|---|---|---|---|
| `POST /api/mqtt/publish` | JWT; valida propiedad de la entidad | `{ "entity_id": 42, "message": {} }` | `204`. |

La API recibe el ID de la entidad y resuelve su configuración desde la base de
datos; no se debe enviar un objeto de entidad como fuente de autoridad.

## 6. Respuestas de error y casos vacíos

Todos los errores, incluidos los del middleware global, las validaciones de Joi
y las rutas inexistentes, tienen esta forma:

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "\"name\" is required",
    "details": [{ "field": "name", "issue": "any.required", "message": "\"name\" is required" }]
  }
}
```

El frontend decide con `error.code`, que es estable; `message` es texto para
personas. Códigos en uso:

| Código | Estado | Cuándo |
|---|---|---|
| `VALIDATION_ERROR` | `400` | Falla un esquema Joi o falta un campo obligatorio. `details` lista cada campo. |
| `INVALID_JSON` | `400` | El cuerpo no es JSON válido. |
| `OTP_INVALID` | `400` | El código OTP no coincide o venció. |
| `UNAUTHENTICATED` | `401` | Falta el token. |
| `TOKEN_INVALID` | `401` | El token es inválido o venció. |
| `INVALID_CREDENTIALS` | `401` | Email o contraseña incorrectos. |
| `FORBIDDEN` | `403` | El recurso pertenece a otro cliente o el rol no alcanza. |
| `<RECURSO>_NOT_FOUND` | `404` | `ENTITY`, `DASHBOARD`, `WIDGET`, `RULECHAIN`, `NOTIFICATION`, `CLIENT`, `ADMIN`. |
| `ROUTE_NOT_FOUND` | `404` | La ruta no existe. |
| `EMAIL_ALREADY_REGISTERED` | `409` | Registro con un email que ya existe. |
| `CLIENT_HAS_DEPENDENCIES` | `409` | Se intenta borrar un cliente con dashboards. |
| `INTERNAL_ERROR` | `500` | Error inesperado; el detalle se registra en el servidor y no se envía. |

Las colecciones vacías responden `200` con un arreglo vacío; `404` queda
reservado para un recurso puntual que no existe.

## 7. Tiempo real con Socket.IO

El cliente conecta al puerto Socket.IO configurado. Eventos emitidos por el
backend:

| Evento | Payload actual | Uso en el frontend |
|---|---|---|
| `historic:created` | `{ "historic": { "historic_id", "entity_id", "recorded_at", "data_key", "data" } }` | Añade el registro confirmado; deduplica por `historic_id`. |
| `entity:connection_changed` | `{ "entity_id": 42, "connection_status": "online" }` | Actualiza el estado de conexión de la entidad. |

Los eventos `data_updated` y `entity_state_change` fueron retirados.
Los eventos canónicos de históricos se emiten tras la persistencia exitosa.

Estos eventos se emiten globalmente en el código actual, no por sala o usuario.
El servidor Socket.IO todavía no valida JWT ni limita las suscripciones por
propiedad; tenerlo presente antes de exponer telemetría a clientes no
confiables.

## 8. Ejemplos de consumo

Los componentes usan servicios que devuelven recursos sin envoltorio:

```js
import { fetchEntities, deleteEntity } from "../services/entities_service";
import { createDashboard } from "../services/dashboards_service";
import { getApiErrorCode, getApiErrorMessage } from "../services/api_errors";

const entities = await fetchEntities(client.client_id);
const dashboard = await createDashboard({
  name: "Producción", description: "Sensores de planta", client_id: client.client_id,
});
try {
  await deleteEntity(entity_id);
} catch (error) {
  console.error(getApiErrorCode(error), getApiErrorMessage(error));
}
```

## 9. Archivos de referencia

- Backend y montaje de rutas: `backend/server.js`.
- Rutas: `backend/routes/`.
- Controladores HTTP: `backend/controllers/api/`.
- Esquemas de entrada: `backend/schemas/`.
- Autenticación y errores: `backend/middlewares/auth.js`,
  `backend/middlewares/validate.js` y `backend/middlewares/error_handler.js`.
- Acceso a datos: `backend/services/` y `backend/models/`.
- Adquisición y reglas: `backend/controllers/datasource_controller.js`,
  `backend/controllers/datasources/` y `backend/controllers/rulechain_engine.js`.
- Eventos: `backend/sockets/`.
- Cliente HTTP y Socket.IO del frontend: `frontend/src/services/api.js` y
  `frontend/src/socket.js`.

## 10. Pendientes de consistencia documentados

El plan completo está en `docs/CONVENCIONES_Y_CONTRATOS.md` §9. Ya están
resueltos el envoltorio único, las colecciones vacías con `200` y los borrados
con `204` (fase 2).

2. Definir autenticación y autorización por sala para Socket.IO antes de
   transmitir eventos a múltiples clientes.
3. Revisar el flujo de registro y OTP, y usar HTTPS para credenciales y tokens
   fuera del entorno local.
4. `PUT /api/clients` no verifica que quien edita sea el propio cliente o su
   administrador.
5. Las fases 5 y 6 están implementadas: migración SQL y retiro de aliases.
   Para otra instalación, seguir `MIGRACION_FASES_5_6.md`.
