# Convenciones de nombres y contratos

> Estado: **aprobado** (decisiones D1 a D5 en la sección 8). El código nuevo sigue
> este documento; el existente se migra por fases (sección 9).

Objetivo: que un mismo concepto tenga **un solo nombre y una sola forma** en la
base de datos, la API, los eventos de Socket.IO y el frontend. Si sabés cómo se
llama un campo en una capa, sabés cómo se llama en todas, y buscarlo con un
`grep` encuentra todos sus usos.

---

## 1. Principios

1. **Un concepto, un nombre.** El nombre de la columna es el nombre del campo
   JSON y el nombre de la propiedad en el frontend. Sin alias (`id` /
   `client_id` / `user_id` para la misma cosa).
2. **El nombre dice el tipo.** Sufijos y prefijos fijos (sección 3) indican si es
   un id, una fecha, un booleano, una duración o un objeto de configuración.
3. **La forma no depende del endpoint.** Toda respuesta usa el mismo envoltorio
   y los mismos niveles (sección 5). Cambia el recurso, no la estructura.
4. **JSON real, nunca JSON dentro de strings.** Antes, `additional_client_ids` y a
   veces `config_data` viajan como texto; eso obliga a `JSON.parse` defensivos
   por todo el frontend.
5. **El contrato vive en un solo lugar** (sección 7) y los tests lo verifican.

## 2. Vocabulario del dominio

Cada concepto tiene un nombre canónico en inglés. Se usa ese nombre en tablas,
campos, rutas, componentes, variables y archivos.

| Concepto | Nombre canónico | Nombre anterior | Notas |
|---|---|---|---|
| Cuenta que inicia sesión | `client` | `user`, `id`, `user_id` | Decisión D2. |
| Cliente administrador de otros | `admin_client` (rol) | `admin`, `admin_id` | Es un `client` con `role = "admin"`. |
| Dispositivo o fuente de datos | `entity` | `device`, `disp`, `dispositivo` | `DeviceList` lista entidades. |
| Tarjeta de un dashboard | `widget` | `device`, `devices_list`, `Device` | La clase `Device` modela widgets. |
| Tablero | `dashboard` | — | |
| Lectura guardada | `historic` | `historial`, `history` | La tabla anterior se llamaba `historial`. |
| Regla de alarma | `alarm` | — | |
| Aviso generado por una alarma | `notification` | — | |
| Flujo de reglas | `rulechain` | `rule_chain` | Una sola palabra. |
| Clave dentro de los datos | `data_key` | `selected_key`, `widget_clave`, `key` | El nombre del valor dentro de `data`. |

**Idioma.** Los identificadores van en inglés; los textos visibles al usuario,
en el idioma de la interfaz. Hoy conviven `valor`, `visto`, `estado_actual`,
`estadoActual`, `disp_name` y `descripcion` con nombres en inglés.

## 3. Reglas de nombres de campos

Todos los campos de datos (columnas, JSON, props que representan datos) van en
`snake_case`.

### Identificadores

| Regla | Correcto | Incorrecto |
|---|---|---|
| La clave primaria es `<recurso>_id`, nunca `id` a secas. | `entity_id` | `id` |
| Una referencia usa **el mismo nombre** que la clave primaria referenciada. | `dashboard_id` en `widgets` | `dash_id`, `board` |
| Si la referencia tiene un rol, el rol va antes: `<rol>_<recurso>_id`. | `admin_client_id`, `owner_client_id` | `admin_id`, `user_id` |
| Una lista de referencias es `<recurso>_ids` y es un arreglo JSON. | `entity_ids: [3, 8]` | `entities_ids`, `"[3,8]"` |
| Los ids se tratan como opacos en el frontend; nunca se calculan. | — | — |

### Sufijos y prefijos de tipo

| Tipo | Forma | Ejemplos |
|---|---|---|
| Booleano | `is_*`, `has_*` | `is_read`, `is_on`, `has_alarms` |
| Fecha y hora (ISO 8601, UTC) | `*_at` | `created_at`, `read_at`, `expires_at`, `last_seen_at` |
| Duración | `*_ms` o `*_s` (la unidad siempre explícita) | `polling_interval_ms`, `heartbeat_timeout_s` |
| Cantidad | `*_count` | `widget_count` |
| Objeto de configuración | `*_config` | `datasource_config`, `widget_config` |
| Discriminador de variante | `*_type` | `datasource_type`, `widget_type`, `node_type` |
| Nombre visible | `name` (dentro de su recurso) | `entity.name`, no `disp_name` |

### Enumeraciones

Strings en minúscula con `snake_case`: `datasource_type: "mqtt" | "api"`,
`widget_type: "switch" | "line_chart" | ...`, `role: "admin" | "client"`.
Nada de números mágicos (`access_level_id == 1`) en el frontend: el backend
traduce y la API expone `role`.

### Palabras reservadas

`status` solo existe en el envoltorio (sección 5). El estado de conexión de
una entidad se llama `connection_status: "online" | "offline"`, no `status`.

## 4. Código: variables, funciones y archivos

Esto amplía `STYLE_GUIDELINES.md` sin contradecirlo.

| Elemento | Convención | Ejemplo |
|---|---|---|
| Campos de datos y variables | `snake_case` | `const selected_widget = ...` |
| Funciones | `camelCase`, verbo primero | `fetchEntities`, `buildWidgetPayload` |
| Componentes React | `PascalCase`, nombre del recurso | `EntityList`, `WidgetCard` |
| Estado React | `[recurso, setRecurso]` en el nombre canónico | `const [widgets, setWidgets]` |
| Manejadores internos / props de evento | `handleX` / `onX` | `handleSave` se pasa como `onSave` |
| Archivos | `snake_case`, sin espacios, nombre del componente | `entity_list.jsx` |
| Colecciones | plural del recurso | `entities`, nunca `entities_list` ni `devices_list` |
| Un elemento de una colección | singular del recurso | `entities.map((entity) => ...)` |

Casos que hoy rompen la regla: `profile_settings_panel .jsx` (tiene un espacio),
`DeviceList` / `devices_list` para widgets y entidades, `proccesing_node.jsx`
(typo), `setis_loading`.

## 5. Contrato de las respuestas HTTP

### Nivel 0: envoltorio (igual en **todas** las respuestas con cuerpo)

```json
{
  "status": "success",
  "data": { },
  "meta": { },
  "error": null
}
```

| Campo | Tipo | Regla |
|---|---|---|
| `status` | `"success"` \| `"error"` | Siempre presente (decisión D3). |
| `data` | objeto \| `null` | Siempre un objeto con el recurso como clave (nivel 1). `null` en errores. |
| `meta` | objeto, opcional | Paginación y totales: `count`, `page`, `page_size`, `total_count`. |
| `error` | objeto \| `null` | Solo cuando `status = "error"`. |

No se agregan campos sueltos en la raíz: hoy `token`, `results` y `message`
aparecen ahí según el endpoint.

Error:

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": "ENTITY_NOT_FOUND",
    "message": "No existe la entidad 42.",
    "details": [{ "field": "name", "issue": "required" }]
  }
}
```

`code` es estable y en `UPPER_SNAKE_CASE` (el frontend decide con él);
`message` es para personas; `details` lista los errores de validación de Joi.

Nombres de código: `<RECURSO>_NOT_FOUND` para un recurso puntual inexistente
(`ENTITY_NOT_FOUND`, `DASHBOARD_NOT_FOUND`, ...), `VALIDATION_ERROR` para
entradas inválidas, `FORBIDDEN` para recursos ajenos y un nombre que describa la
regla de negocio para el resto (`EMAIL_ALREADY_REGISTERED`,
`CLIENT_HAS_DEPENDENCIES`). La lista vigente está en
`docs/ARQUITECTURA_Y_API.md` §6.

En el backend se responde siempre con `backend/utils/response.js`
(`sendSuccess`, `sendCollection`, `sendNoContent`) y se falla con
`new AppError(message, status, code, details)`. En el frontend se leen los
errores con `getApiErrorMessage` y `getApiErrorCode` de `src/services/api.js`.

### Nivel 1: contenedor del recurso

La clave es el nombre canónico: **singular para un recurso, plural para una
colección**. Siempre la misma clave para el mismo recurso, en cualquier endpoint.

```json
{ "data": { "entity": { } } }
{ "data": { "entities": [ ] } }
{ "data": { "session": { "client": { }, "token": "..." } } }
```

### Nivel 2: el recurso

- Campos escalares de la tabla, más referencias `*_id` y listas `*_ids`.
- Como máximo, objetos de configuración `*_config`, cuya forma la decide el
  discriminador `*_type` que está en este mismo nivel.
- Los recursos relacionados **no** se incrustan por defecto. Si un endpoint los
  incluye, van bajo su clave plural (`dashboard.widgets`) y tienen exactamente
  la misma forma que en su propio endpoint.
- No hay campos calculados para la vista (`rulechain_name`, `entity_name`): eso
  lo arma el frontend (sección 6).

### Nivel 3: configuración de variante

Cada valor de `*_type` tiene su propio esquema documentado. Ejemplo:

```json
{
  "entity_id": 42,
  "client_id": 7,
  "name": "Sensor Patio",
  "datasource_type": "mqtt",
  "datasource_config": {
    "sub_topic": "patio/temp",
    "pub_topic": "patio/cmd",
    "heartbeat_timeout_s": 60
  },
  "connection_status": "online",
  "rulechain_id": 3,
  "created_at": "2026-10-29T18:00:00Z"
}
```

| `datasource_type` | Campos de `datasource_config` |
|---|---|
| `mqtt` | `sub_topic`, `pub_topic`, `heartbeat_timeout_s` |
| `api` | `base_url`, `method`, `polling_interval_ms`, `data_key`, `query_params`, `headers`, `request_body` (estos tres son objetos) |

No se baja más de tres niveles. La única excepción es un grafo (nivel 4).

### Grafos y árboles (rulechains)

Se transmiten **planos y normalizados**: lista de nodos y lista de aristas que
se referencian por id. Nunca como árbol anidado de `children`.

```json
{
  "rulechain": {
    "rulechain_id": 3,
    "client_id": 7,
    "name": "Alerta temperatura",
    "entity_ids": [42],
    "definition": {
      "nodes": [
        { "node_id": "n1", "node_type": "input", "position": { "x": 0, "y": 0 }, "node_config": {} },
        { "node_id": "n2", "node_type": "filter", "position": { "x": 200, "y": 0 }, "node_config": { "threshold": 30, "operator": "greater_than" } }
      ],
      "edges": [{ "edge_id": "e1", "source_node_id": "n1", "target_node_id": "n2" }]
    }
  }
}
```

Lo visual de React Flow (`label`, `color`, `handles`, `measured`) no se guarda:
se deriva de `node_type` con `node_schemas.js`. El formato anterior guardaba el nodo de React
Flow completo, con sus datos de presentación.

### Códigos HTTP

| Caso | Código | Cuerpo |
|---|---|---|
| Lectura correcta, incluida una colección vacía | `200` | `data.<recurso>` (`[]` si está vacía, **nunca 404**) |
| Creación | `201` | `data.<recurso>` completo, con su id |
| Actualización | `200` | `data.<recurso>` completo y actualizado (no solo un `message`) |
| Borrado, o acción sin recurso resultante (logout, publicar MQTT, OTP) | `204` | Sin cuerpo |
| Validación | `400` / `422` | `error.details` |
| Sin sesión / sin permiso | `401` / `403` | `error.code` |
| Recurso puntual inexistente | `404` | `error.code` |

## 6. Rutas, eventos y frontend

**Rutas REST.** Sustantivos en plural, anidadas por pertenencia, con acciones
como subrecursos:

```
GET    /api/entities
GET    /api/entities/:entity_id
GET    /api/dashboards/:dashboard_id/widgets
POST   /api/notifications/:notification_id/read
```

El cliente actual sale del JWT. No se manda `client_id` en la query o el cuerpo
para decir "de quién son los datos"; hoy el frontend lo envía en muchas llamadas
(entidades, alarmas, dashboards, notificaciones).

**Eventos de Socket.IO.** `recurso:acción` en `snake_case`, con el recurso
canónico como contenido: `historic:created` → `{ historic }`,
`entity:connection_changed` → `{ entity_id, connection_status }`. Los eventos anteriores eran
`data_updated` y `entity_state_change`.

**Frontend: una sola capa toca la API.** Por cada recurso hay un módulo en
`src/services/` (`entities_service.js`, `widgets_service.js`, ...) que:

1. llama a `api` y desarma el envoltorio (`response.data.data.entities`);
2. devuelve objetos con los nombres canónicos;
3. es el único lugar donde se arman payloads de escritura.

Los componentes nunca leen `response.data.data` ni construyen URLs. Los
"modelos de vista" (filas de tablas, árboles, nodos con callbacks) se construyen
a partir de esos objetos en funciones puras (`toEntityRow(entity, rulechains)`)
y **nunca vuelven a la API**.

## 7. Dónde vive el contrato y cómo se hace cumplir

1. **Esquemas en el backend como fuente única.** Los Joi de `backend/schemas/`
   definen entrada y salida de cada recurso, y validan con `.unknown(false)` para
   que un campo mal nombrado falle en vez de pasar en silencio.
   Desde la fase 6 se validan directamente los nombres canónicos, sin aliases
   ni `stripUnknown`. `backend/contracts/resources.js` proyecta los campos públicos
   y normaliza JSON, booleanos y fechas; no expone columnas privadas. Los grafos
   se validan con `backend/schemas/definition_schema.js`.
2. **Typedefs en el frontend.** `src/contracts/*.js` con JSDoc
   (`@typedef {Object} Entity`) que reflejan esos esquemas; dan autocompletado sin
   migrar a TypeScript.
3. **Tests de contrato.** Las factories de `src/test/test_utils.jsx` (`buildEntity`,
   `buildWidget`, ...) deben pasar el esquema; si alguien cambia un nombre, falla
   un test y no producción.
4. **ESLint** (`backend/.eslintrc.json` y `eslintConfig` en
   `frontend/package.json`; se corre con `npm run lint` en cada proyecto):

   | Regla | Nivel | Qué controla |
   |---|---|---|
   | `id-match` | error | Cada identificador declarado es `snake_case`, `camelCase`, `PascalCase` o `UPPER_SNAKE_CASE`, sin mezclas como `selected_Key`. |
   | `id-denylist` | error | Nombres heredados que se van a migrar (`valor`, `visto`, `estadoActual`, `widget_clave`, `historial`, ...). Está en `error` desde la fase 5; los fixtures de migración tienen una excepción explícita. |
   | `no-restricted-syntax` (backend) | error | Prohíbe `res.json` / `res.send` fuera de `utils/response.js`. |
   | `no-restricted-syntax` (frontend) | error | Prohíbe leer `.data.data` fuera de `src/services/`. |
   | `no-restricted-imports` (frontend) | error | Prohíbe importar Axios o el cliente HTTP `services/api` fuera de `src/services/` (excepto tests). |
   | `testing-library/no-node-access`, `no-container` (tests) | warn | Los `IconButton` de MUI no tienen nombre accesible y los tests los ubican con `closest("button")`. Pasan a `error` cuando cada botón de icono tenga `aria-label`. |

5. **Revisión de PR.** Toda tabla, campo, ruta o evento nuevo cita este documento.

## 8. Decisiones

| # | Decisión | Resultado |
|---|---|---|
| D1 | Idioma de los identificadores. | Inglés en todo. |
| D2 | `client` o `user` para la cuenta. | `client` (es lo que dice la base: `clients`, `client_id`). Se renombra `rulechains.user_id`. |
| D3 | Envoltorio: `status` (estilo JSend) u `ok: true`. | `status: "success" \| "error"`. |
| D4 | Fechas. | ISO 8601 UTC en la API; conversión a hora local solo al mostrar. |
| D5 | Enums en minúscula (`mqtt`, `line_chart`). | Sí, con migración de datos. |

## 9. Plan de migración

Cada fase se puede mergear sola y deja los tests en verde.

1. ✅ **Adoptar las reglas para código nuevo** y agregar las reglas de ESLint.
2. ✅ **Envoltorio y códigos HTTP:** `backend/utils/response.js`, códigos de
   error estables, colecciones vacías con `200` y `204` en borrados. Cubierto por
   `backend/test/unit/controllers_contract.test.js`.
3. ✅ **Capa de servicios del frontend** (sección 6): todas las llamadas HTTP,
   incluido login, registro y notificaciones, viven en `src/services/*_service.js`.
   Los servicios arman los payloads y devuelven el recurso sin el envoltorio de
   Axios. Los adaptadores existentes en `component/database_data_functions.jsx`
   y `component/notification_service.js` delegan en ellos; el modelo de widgets
   para la vista se arma en `view_models/dashboard_widgets.js`. Las reglas de
   ESLint impiden volver a importar el transporte o leer `.data.data` desde los
   componentes. Cubierto por `src/services/resource_services.test.js` y las
   pruebas de los consumidores. Los nombres de campos y las rutas existentes
   se conservan hasta la fase 4.
4. ✅ **Renombres con compatibilidad:** durante esta fase el backend aceptó
   nombres nuevos y anteriores y devolvió ambos durante una versión. El frontend
   pasó a usar los canónicos: JSON nativo, fechas UTC, credenciales separadas,
   grafos normalizados y eventos emitidos después de persistir históricos.
   Esa compatibilidad fue retirada en la fase 6. Los contratos actuales se
   verifican en `canonical_contracts.test.js` y `canonical_runtime.test.js`.
5. ✅ **Migraciones SQL** de columnas y valores: `backend/migrations/005_canonical_contracts.js`
   migra tablas, columnas, JSON, enums, credenciales y grafos; usa bloqueo y registro
   de versión. Requiere respaldo y escritores detenidos. El id interno de roles
   permanece permitido. Ver [MIGRACION_FASES_5_6.md](MIGRACION_FASES_5_6.md).
6. ✅ **Quitar los alias** viejos: rutas plurales, eventos canónicos, JWT con
   `client_id`, esquemas estrictos y proyecciones públicas sin campos anteriores.
   El frontend usa enums en `snake_case` y payloads distintos para crear/editar.
   `id-denylist` pasó a error. Las conversiones heredadas viven exclusivamente
   en las migraciones. Cubierto por `canonical_contracts.test.js`,
   `canonical_runtime.test.js`, la suite del frontend y la integración MySQL
   `backend/test/integration/migration_mysql.js`.

## Anexo: renombres propuestos

| Dónde | Hoy | Propuesto |
|---|---|---|
| `alarms` | `valor` | `threshold` |
| `alarms` | `selected_key` | `data_key` |
| `alarms` | `alarm_condition` (`>` / `<`) | `operator` (`greater_than` / `less_than`) |
| `notifications` | `visto` | `is_read` |
| `notifications` | `date` | `created_at` |
| `notifications` | `data` | `value` |
| `historial` (tabla) | `historial` | `historics` |
| `historial` | `date` | `recorded_at` |
| `historial` | `selected_key` | `data_key` |
| `entities` | `disp_name` | `name` |
| `entities` | `sub_topic`, `pub_topic`, `token` (columnas sueltas) | dentro de `datasource_config` / credencial aparte |
| `entities` → `datasource_config` | `polling_interval` | `polling_interval_ms` |
| `entities` → `datasource_config` | `heartbeat_timeout` | `heartbeat_timeout_s` |
| `entities` → `datasource_config` | `status` | `connection_status` (al nivel de la entidad) |
| `clients` | `access_level_id` | `role` en la API (la tabla puede seguir con su id) |
| `clients` | `admin_id` | `admin_client_id` |
| `dashboards` | `additional_client_ids` (string) | `shared_client_ids` (arreglo JSON) |
| `widgets` | `config_data` | `widget_config` |
| `widgets` → `widget_config` | `estado_actual` / `estadoActual` | `is_on` |
| `widgets` → `widget_config` | `scriptHtml`, `scriptCss` | `html_template`, `css` |
| `widgets` → `widget_config` | `widget_clave` / `selected_key` | `data_key` |
| `widgets` | `widget_name` | `name` |
| `rulechains` | `user_id` | `client_id` |
| `rulechains` | `entities_ids` | `entity_ids` |
| `rulechains` | `rulechain` (grafo) | `definition` |
| `otp_tokens` | `id`, `used` | `otp_token_id`, `is_used` |
| Login | `data.client.id` y `data.client.client_id` | solo `client_id` |
| Socket.IO | `data_updated`, `entity_state_change` | `historic:created`, `entity:connection_changed` |

`mqtt_user` queda fuera: su esquema lo impone el broker.
