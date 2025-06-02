// backend/controllers/api/rulechain_controller.js

const AppError = require('../../utils/appError');
const RulechainService = require('../../services/dbServices/rulechain_service');

/**
 * GET /api/rulechain?client_id=<id>
 * Recupera todos los rulechains asociados a un client_id (user).
 */
exports.getRulechains = async (req, res, next) => {
  try {
    const { client_id } = req.query;
    // Se asume validateSchema(getRulechainsSchema, 'query') antes de este controlador

    const rulechains = await RulechainService.fetchByClientId(client_id);
    return res.status(200).json({
      status: 'success',
      results: rulechains.length,
      data: { rulechains },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/rulechain/:rulechain_id
 * Recupera un rulechain por su ID.
 */
exports.getRulechainById = async (req, res, next) => {
  try {
    const { rulechain_id } = req.params;
    // Se asume validateSchema(getRulechainByIdSchema, 'params') antes de este controlador

    const rulechain = await RulechainService.fetchById(rulechain_id);
    if (!rulechain) {
      return next(new AppError('Rulechain no encontrado', 404));
    }
    return res.status(200).json({
      status: 'success',
      data: { rulechain },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/rulechain
 * Inserta un nuevo rulechain.
 */
exports.insertRulechain = async (req, res, next) => {
  try {
    const { user_id, name, description, rulechain: rcJson, entities_ids } = req.body;
    // Se asume validateSchema(createRulechainSchema) antes de este controlador

    const newRulechain = await RulechainService.createRulechain({
      user_id,
      name,
      description,
      rcJson,
      entities_ids,
    });

    return res.status(201).json({
      status: 'success',
      data: { rulechain: newRulechain },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PUT /api/rulechain
 * Actualiza un rulechain existente (incluye campo `compiled` generado por el service).
 */
exports.updateRulechain = async (req, res, next) => {
  try {
    const { rulechain_id, name, description, rulechain: rcJson, entities_ids } = req.body;
    // Se asume validateSchema(updateRulechainSchema) antes de este controlador

    await RulechainService.updateRulechain({
      rulechain_id,
      name,
      description,
      rcJson,
      entities_ids,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Rulechain actualizado correctamente',
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * DELETE /api/rulechain/:rulechain_id
 * Elimina un rulechain por su ID.
 */
exports.deleteRulechain = async (req, res, next) => {
  try {
    const { rulechain_id } = req.params;
    // Se asume validateSchema(deleteRulechainSchema, 'params') antes de este controlador

    const deleted = await RulechainService.deleteRulechain(rulechain_id);
    if (!deleted) {
      return next(new AppError('Rulechain no encontrado', 404));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Rulechain eliminado correctamente',
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
