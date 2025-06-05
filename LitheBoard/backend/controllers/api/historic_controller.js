// backend/controllers/api/historic_controller.js

const AppError = require('../../utils/app_error');
const HistoricService = require('../../services/historic_service');

/**
 * GET /api/historic/entity/:entity_id
 * Recupera todos los registros históricos de un entity_id.
 */
exports.getHistoricsByEntityId = async (req, res, next) => {
  try {
    const { entity_id } = req.params;
    // Se asume validateSchema(getHistoricsByEntitySchema, 'params') antes de este controller

    const historics = await HistoricService.fetchByEntityId(entity_id);
    return res.status(200).json({
      status: 'success',
      results: historics.length,
      data: { historics },
    });
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
    // Se asume validateSchema(getHistoricByClientSchema, 'params') antes de este controller

    const historics = await HistoricService.fetchByClientId(client_id);
    return res.status(200).json({
      status: 'success',
      results: historics.length,
      data: { historics },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/historic
 * Inserta un nuevo registro histórico en la tabla `historial`.
 */
exports.insertHistoric = async (req, res, next) => {
  try {
    const { entity_id, date, data, client_id, selected_key } = req.body;
    // Se asume validateSchema(createHistoricSchema) antes de este controller

    await HistoricService.createHistoric({ entity_id, date, data, client_id, selected_key });
    return res.status(201).json({
      status: 'success',
      message: 'Historic data inserted successfully',
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
