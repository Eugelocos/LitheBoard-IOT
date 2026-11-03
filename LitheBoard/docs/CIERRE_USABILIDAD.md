# Cierre de usabilidad

## Comportamiento implementado

- Una entidad sin rulechain asignada (`rulechain_id = 0`) guarda el mensaje completo en historics. El selector permite volver a este comportamiento. No se crea una fila de rulechain por entidad.
- Una rulechain propia controla su almacenamiento; no se agrega un segundo guardado. Las reglas sin selector de clave pueden procesar el mensaje completo.
- Actualizar o borrar entidades detiene sus pollings, suscripciones y timers. Los pollings HTTP no se superponen y descartan respuestas posteriores a la cancelación.
- Borrar una entidad elimina su historial y desvincula widgets y alarmas en una transacción. Si falla, se revierte y se restaura el datasource. Las alarmas desvinculadas siguen disponibles para editar o borrar.
- Las alarmas se pueden crear, editar y borrar. Borrarlas también elimina sus notificaciones. No requiere SMTP.
- Las operaciones principales de entidades, alarmas, dashboards, rulechains y borrado de widgets muestran fallos; se bloquean los botones de envío durante la petición. Los borrados piden confirmación.
- Una rulechain asignada no se puede borrar: primero debe cambiarse la asignación de sus entidades.
- Socket.IO exige el JWT de sesión. Los eventos se envían a los propietarios, subcuentas autorizadas y clientes con dashboards compartidos que usan la entidad. Los permisos se consultan por evento; al expirar el token se cierra la conexión.
- El dashboard vuelve a consultar sus datos al reconectar, para recuperar los mensajes del intervalo desconectado.

## Verificación manual pendiente con el entorno completo

1. Crear una entidad MQTT o API sin regla, enviar JSON con varias claves y comprobar un solo histórico con el mensaje completo.
2. Crear un widget para esa entidad; comprobar la carga inicial, nuevas muestras y actualización después de reconectar.
3. Asignar una regla propia con almacenamiento; comprobar que no se duplica el histórico. Volver a la opción predeterminada.
4. Cambiar la configuración del datasource y confirmar que la anterior deja de emitir. Borrar la entidad y comprobar las dependencias.
5. Crear, editar y borrar una alarma; provocar una respuesta HTTP fallida y comprobar que se conserva el formulario para reintentar.
6. Cancelar un borrado y comprobar que no cambia nada. Repetir durante una conexión lenta y comprobar que no se repite el envío.
7. Abrir dos cuentas en navegadores independientes: comprobar que no reciben eventos ajenos. Compartir un dashboard y comprobar acceso; retirar el permiso y comprobar que dejan de llegar eventos.

Las pruebas unitarias usan servicios simulados; no reemplazan estas comprobaciones con MySQL, MQTT y navegador reales.
