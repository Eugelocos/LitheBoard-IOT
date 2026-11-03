// backend/controllers/api/alarm_controller.js

const AlarmService = require('../../services/alarm_service');
const EntityService = require('../../services/entity_service');
const AppError = require('../../utils/app_error');
const { assertOwnership } = require('../../utils/authorization');
const { sendSuccess, sendCollection, sendNoContent } = require('../../utils/response');

/**
 * GET /api/alarm/:client_id
 * Recupera todas las alarmas asociadas a un client_id.
 */
exports.getAlarmsByClientId = async (req, res, next) => {
  try {
    const { client_id } = req.params;

    assertOwnership(req.user, client_id, 'listado de alarmas');

    const alarms = await AlarmService.fetchAlarmsByClientId(client_id);
    return sendCollection(res, 'alarms', alarms);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/alarm
 * Inserta una nueva alarma en la base de datos.
 */
exports.insertAlarm = async (req, res, next) => {
  try {
    const { entity_id, threshold, client_id, data_key, operator } = req.body;

    if (
      entity_id == null ||
      threshold == null ||
      client_id == null ||
      !data_key ||
      !operator
    ) {
      return next(
        new AppError(
          'Todos los campos son obligatorios: entity_id, threshold, client_id, data_key, operator.',
          400,
          'VALIDATION_ERROR'
        )
      );
    }

    assertOwnership(req.user, client_id, 'cliente');

    const entity = await EntityService.fetchEntityById(entity_id);
    if (!entity) {
      return next(new AppError('Entidad no encontrada', 404, 'ENTITY_NOT_FOUND'));
    }
    assertOwnership(req.user, entity.client_id, 'entidad');

    const alarm = await AlarmService.createAlarm({
      entity_id,
      threshold,
      client_id,
      data_key,
      operator,
    });

    return sendSuccess(res, 201, { alarm });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

exports.updateAlarm = async (req, res, next) => {
  try {
    const alarm = await AlarmService.fetchById(req.params.alarm_id);
    if (!alarm) throw new AppError('Alarm not found', 404, 'ALARM_NOT_FOUND');
    assertOwnership(req.user, alarm.client_id, 'alarma');
    const entity = await EntityService.fetchEntityById(req.body.entity_id);
    if (!entity) throw new AppError('Entity not found', 404, 'ENTITY_NOT_FOUND');
    assertOwnership(req.user, entity.client_id, 'entidad');
    if (Number(entity.client_id) !== Number(alarm.client_id)) {
      throw new AppError('Entity and alarm must belong to the same client', 400, 'VALIDATION_ERROR');
    }
    const updated = await AlarmService.updateAlarm(req.params.alarm_id, req.body);
    return sendSuccess(res, 200, { alarm: updated });
  } catch (error) { next(error); }
};
exports.deleteAlarm = async (req, res, next) => {
  try {
    const alarm = await AlarmService.fetchById(req.params.alarm_id);
    if (!alarm) throw new AppError('Alarm not found', 404, 'ALARM_NOT_FOUND');
    assertOwnership(req.user, alarm.client_id, 'alarma');
    await AlarmService.deleteAlarm(req.params.alarm_id);
    return sendNoContent(res);
  } catch (error) { next(error); }
};
