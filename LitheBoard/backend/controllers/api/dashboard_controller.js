// backend/controllers/api/dashboard_controller.js

const AppError = require('../../utils/app_error');
const DashboardService = require('../../services/dashboard_service');
const { assertOwnership } = require('../../utils/authorization');
const { sendSuccess, sendCollection, sendNoContent } = require('../../utils/response');

const dashboardNotFound = () => new AppError('Dashboard no encontrado', 404, 'DASHBOARD_NOT_FOUND');

/**
 * POST /api/dashboard
 * Inserta un nuevo dashboard en la BD.
 */
exports.insertDashboard = async (req, res, next) => {
  try {
    const { name, description, client_id, shared_client_ids = [] } = req.body;

    assertOwnership(req.user, client_id, 'cliente');

    const dashboard = await DashboardService.createDashboard({
      name: name.trim(),
      description: description.trim(),
      client_id,
      shared_client_ids,
    });

    return sendSuccess(res, 201, { dashboard });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/dashboard/:client_id
 * Recupera todos los dashboards donde client_id es dueño o está en shared_client_ids.
 */
exports.getDashboardsByClientId = async (req, res, next) => {
  try {
    const { client_id } = req.params;

    assertOwnership(req.user, client_id, 'listado de dashboards');

    const dashboards = await DashboardService.fetchDashboardsByClientId(client_id);
    return sendCollection(res, 'dashboards', dashboards);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PUT /api/dashboard
 * Actualiza nombre, descripción y shared_client_ids, y devuelve el dashboard actualizado.
 */
exports.updateDashboard = async (req, res, next) => {
  try {
    const { dashboard_id, name, description, shared_client_ids = [] } = req.body;

    const existing = await DashboardService.fetchById(dashboard_id);
    if (!existing) return next(dashboardNotFound());
    assertOwnership(req.user, existing.client_id, 'dashboard');

    const updated = await DashboardService.updateDashboard({
      dashboard_id,
      name: name.trim(),
      description: description.trim(),
      shared_client_ids,
    });
    if (!updated) return next(dashboardNotFound());

    const dashboard = await DashboardService.fetchById(dashboard_id);
    return sendSuccess(res, 200, { dashboard });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * DELETE /api/dashboard/:dashboard_id
 * Elimina un dashboard y sus widgets asociados.
 */
exports.deleteDashboard = async (req, res, next) => {
  try {
    const { dashboard_id } = req.params;

    const existing = await DashboardService.fetchById(dashboard_id);
    if (!existing) return next(dashboardNotFound());
    assertOwnership(req.user, existing.client_id, 'dashboard');

    const result = await DashboardService.deleteDashboard(dashboard_id);
    if (result === 'not_found') return next(dashboardNotFound());

    return sendNoContent(res);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/dashboard/assign
 * Comparte un dashboard con un cliente (shared_client_ids). Es idempotente:
 * si ya estaba compartido responde igual, con el dashboard actual.
 */
exports.assignDashboardToClient = async (req, res, next) => {
  try {
    const { client_id, dashboard_id } = req.body;

    const existing = await DashboardService.fetchById(dashboard_id);
    if (!existing) return next(dashboardNotFound());
    assertOwnership(req.user, existing.client_id, 'dashboard');

    const assign_result = await DashboardService.assignDashboardToClient(client_id, dashboard_id);
    if (assign_result === 'not_found') return next(dashboardNotFound());

    const dashboard = await DashboardService.fetchById(dashboard_id);
    return sendSuccess(res, 200, { dashboard });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
