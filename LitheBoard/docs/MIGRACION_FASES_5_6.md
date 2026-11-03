# Migración de convenciones: fases 5 y 6

La aplicación usa el esquema canónico después de `005_canonical_contracts`.
La migración requiere MySQL 8.0 y se ejecuta con todos los escritores de la
aplicación detenidos (HTTP, MQTT, polling y procesos auxiliares).

## Aplicación en otra instalación

1. Guardar un dump completo con `mysqldump --single-transaction --routines
   --triggers --set-gtid-purged=OFF`, usando las credenciales de esa instalación.
   Guardarlo fuera del control de versiones y verificar que se pueda restaurar.
2. Restaurar el dump en una base aislada. Con las variables `DB_HOST`, `DB_PORT`,
   `DB_USER`, `DB_PASSWORD` y `DB_NAME` apuntando a esa copia, ejecutar desde
   `backend/`:

   ```sh
   node test/integration/migration_mysql.js
   ```

   La prueba aplica la migración dos veces, comprueba conteos de filas y nombres
   de columnas, y prueba los servicios contra MySQL. Sus escrituras de prueba
   se revierten; la migración de la copia permanece aplicada.
3. Con los escritores aún detenidos, apuntar `DB_*` a la base a migrar y ejecutar:

   ```sh
   node migrations/run.js --apply --backup /ruta/absoluta/respaldo.sql
   ```

4. Iniciar la nueva versión del backend y frontend juntos. Los clientes que
   guardaban sesiones sin `client_id` deben iniciar sesión nuevamente.

El runner exige un respaldo no vacío. El archivo suministrado debe pertenecer
a la base que se va a migrar; el runner no puede verificar esa procedencia.
El dump inicial heredado de `db/dump.sql` también necesita esta migración antes
de iniciar la aplicación actual.

## Cambios

- Renombra columnas del anexo, `historial` a `historics` y `rulechain` a
  `rulechains`. Renombra también la referencia en `client_admins`.
- Normaliza los enums de fuentes y widgets y los operadores de alarmas.
- Convierte las listas guardadas como strings en arreglos JSON. Normaliza las
  configuraciones de widgets y los grafos existentes; recompila los rulechains.
  Los borradores vacíos se conservan con `compiled = null`.
- Separa `credential` y `connection_status` de `datasource_config`. Una fuente
  sin estado conocido conserva `NULL`; la API omite ese campo.
- El temporizador MQTT anterior usaba milisegundos: `heartbeat_timeout` se
  divide por 1000 al migrarlo a `heartbeat_timeout_s`. El polling mantiene
  milisegundos. Las nuevas entradas muestran sus unidades en el formulario.
- Las notificaciones guardan `value` como JSON, incluidos strings simples,
  números, objetos, `false` y `0`. Las fechas existentes conservan su valor UTC;
  las conexiones MySQL y las nuevas lecturas usan UTC.
- `access_level_id` permanece como relación interna permitida por el anexo;
  las entradas y salidas públicas usan `role`.
- Desaparecen las rutas singulares, los eventos antiguos y los aliases de
  campos/JWT. Joi rechaza campos desconocidos en lugar de descartarlos.
- La traducción de grafos al formato del compilador es interna. La API y la
  base guardan exclusivamente `definition` normalizado.

## Reintentos y recuperación

`schema_migrations` registra la versión terminada. Un segundo intento terminado
no modifica datos. Un bloqueo de MySQL evita dos migraciones simultáneas.
Los datos y grafos se validan antes de los renombres; los renombres reconocen
columnas ya migradas para permitir continuar un intento interrumpido.

MySQL confirma DDL implícitamente: esta migración **no tiene rollback SQL
automático**. Si la aplicación debe volver a la versión anterior, mantener los
escritores detenidos y restaurar el dump completo en una base vacía; no importar
el dump encima de tablas parcialmente migradas. Restaurar también la versión
anterior de la aplicación. Conservar el respaldo hasta verificar la instalación.

`backend/migrations/legacy_resources.js` conserva conversiones exclusivamente
para los datos del dump anterior; no forma parte de la validación HTTP ni de
las respuestas de la aplicación.
