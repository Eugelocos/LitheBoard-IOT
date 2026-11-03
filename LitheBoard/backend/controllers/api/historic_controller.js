// backend/controllers/api/historic_controller.js

const AppError = require('../../utils/app_error');
const HistoricService = require('../../services/historic_service');
const EntityService = require('../../services/entity_service');
const { assertOwnership } = require('../../utils/authorization');
const { sendNoContent, sendCollection } = require('../../utils/response');

/**
 * GET /api/historic/entity/:entity_id
 * Recupera todos los registros históricos de un entity_id.
 */
exports.getHistoricsByEntityId = async (req, res, next) => {
  try {
    const { entity_id } = req.params;

    const entity = await EntityService.fetchEntityById(entity_id);
    if (!entity) {
      return next(new AppError('Entidad no encontrada', 404, 'ENTITY_NOT_FOUND'));
    }
    assertOwnership(req.user, entity.client_id, 'historics');

    const historics = await HistoricService.fetchByEntityId(entity_id);
    return sendCollection(res, 'historics', historics);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/historic/client/:client_id
 * Recupera todos los registros históricos de un client_id.
 */
exports.getHistoricByClientId = async (req, res, next) => {
  try {
    const { client_id } = req.params;

    assertOwnership(req.user, client_id, 'historics');

    const historics = await HistoricService.fetchByClientId(client_id);
    return sendCollection(res, 'historics', historics);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/historic
 * Inserta un nuevo registro histórico en la tabla `historics`.
 * Responde 204: el servicio no devuelve el registro creado.
 */
exports.insertHistoric = async (req, res, next) => {
  try {
    const { entity_id, recorded_at, data, client_id, data_key } = req.body;

    assertOwnership(req.user, client_id, 'cliente');

    const entity = await EntityService.fetchEntityById(entity_id);
    if (!entity) {
      return next(new AppError('Entidad no encontrada', 404, 'ENTITY_NOT_FOUND'));
    }
    assertOwnership(req.user, entity.client_id, 'entidad');

    await HistoricService.createHistoric({ entity_id, recorded_at, data, client_id, data_key });
    return sendNoContent(res);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
