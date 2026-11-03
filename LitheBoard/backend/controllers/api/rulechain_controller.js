// backend/controllers/api/rulechain_controller.js

const AppError = require('../../utils/app_error');
const RulechainService = require('../../services/dbServices/rulechain_service');
const { assertOwnership } = require('../../utils/authorization');
const { sendSuccess, sendCollection, sendNoContent } = require('../../utils/response');

const rulechainNotFound = () => new AppError('Rulechain no encontrada', 404, 'RULECHAIN_NOT_FOUND');

/**
 * GET /api/rulechain?client_id=<id>
 * Recupera todos los rulechains asociados a un client_id (user).
 */
exports.getRulechains = async (req, res, next) => {
  try {
    const { client_id } = req.query;

    assertOwnership(req.user, client_id, 'listado de rulechains');

    const rulechains = await RulechainService.fetchByClientId(client_id);
    return sendCollection(res, 'rulechains', rulechains);
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

    const rulechain = await RulechainService.fetchById(rulechain_id);
    if (!rulechain) return next(rulechainNotFound());

    assertOwnership(req.user, rulechain.client_id, 'rulechain');

    return sendSuccess(res, 200, { rulechain });
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
    const { client_id, name, description, definition: rcJson, entity_ids } = req.body;

    assertOwnership(req.user, client_id, 'cliente');

    const rulechain = await RulechainService.createRulechain({
      client_id,
      name,
      description,
      rcJson,
      entity_ids,
    });

    return sendSuccess(res, 201, { rulechain });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PUT /api/rulechain
 * Actualiza un rulechain existente (incluye campo `compiled` generado por el service)
 * y lo devuelve actualizado.
 */
exports.updateRulechain = async (req, res, next) => {
  try {
    const { rulechain_id, name, description, definition: rcJson, entity_ids } = req.body;

    const existing = await RulechainService.fetchById(rulechain_id);
    if (!existing) return next(rulechainNotFound());
    assertOwnership(req.user, existing.client_id, 'rulechain');

    await RulechainService.updateRulechain({
      rulechain_id,
      name,
      description,
      rcJson,
      entity_ids,
    });

    const rulechain = await RulechainService.fetchById(rulechain_id);
    return sendSuccess(res, 200, { rulechain });
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

    const existing = await RulechainService.fetchById(rulechain_id);
    if (!existing) return next(rulechainNotFound());
    assertOwnership(req.user, existing.client_id, 'rulechain');

    const deleted = await RulechainService.deleteRulechain(rulechain_id);
    if (!deleted) return next(rulechainNotFound());

    return sendNoContent(res);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
