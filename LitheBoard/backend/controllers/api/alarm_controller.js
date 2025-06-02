// backend/controllers/api/alarm_controller.js

const AlarmService = require('../../services/alarm_service');
const AppError = require('../../utils/appError');

/**
 * GET /api/alarm/:client_id
 * Recupera todas las alarmas asociadas a un client_id.
 */
exports.getAlarmsByClientId = async (req, res, next) => {
  try {
    const { client_id } = req.params;

    // Si se integra Joi, aquí se podría validar client_id (p. ej. Joi.number().integer().required())
    // Ejemplo (suponiendo que ya tienes un middleware validateSchema en la ruta):
    // validateSchema(getAlarmsSchema)

    // Llamamos al service para obtener las alarmas
    const alarms = await AlarmService.fetchAlarmsByClientId(client_id);

    if (!alarms || alarms.length === 0) {
      // Lanzamos un AppError con código 404; el middleware lo capturará
      return next(new AppError('No se encontraron alarmas para este cliente.', 404));
    }

    // Si todo ok, enviamos la lista de alarmas
    return res.status(200).json(alarms);
  } catch (err) {
    // Enviamos el error al handler global
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/alarm
 * Inserta una nueva alarma en la base de datos.
 */
exports.insertAlarm = async (req, res, next) => {
  try {
    const { entity_id, valor, client_id, selected_key, alarm_condition } = req.body;

    // Aquí debería correr un middleware de validación Joi antes de llegar al controller,
    // p. ej. validateSchema(createAlarmSchema). Para este ejemplo, hacemos validación mínima:
    if (
      entity_id == null ||
      valor == null ||
      client_id == null ||
      !selected_key ||
      !alarm_condition
    ) {
      // En lugar de retornar directamente, lanzamos un AppError que el handler global procesará
      return next(
        new AppError(
          'Todos los campos son obligatorios: entity_id, valor, client_id, selected_key, alarm_condition.',
          400
        )
      );
    }

    // Delegamos la inserción al service
    const newAlarm = await AlarmService.createAlarm({
      entity_id,
      valor,
      client_id,
      selected_key,
      alarm_condition,
    });

    // El servicio puede devolver el registro recién creado (incluido alarm_id)
    return res.status(201).json({
      message: 'Alarma insertada exitosamente',
      alarm: newAlarm,
    });
  } catch (err) {
    // Si el service lanza un AppError con un código adecuado, lo propaga
    if (err instanceof AppError) {
      return next(err);
    }
    // En caso de error inesperado, convertimos a AppError 500
    return next(new AppError(err.message, 500));
  }
};
