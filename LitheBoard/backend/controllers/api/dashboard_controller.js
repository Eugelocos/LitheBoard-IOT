// backend/controllers/api/dashboard_controller.js

const AppError = require('../../utils/appError');
const DashboardService = require('../../services/dashboard_service');

/**
 * POST /api/dashboard
 * Inserta un nuevo dashboard en la BD.
 */
exports.insertDashboard = async (req, res, next) => {
  try {
    const { name, description, client_id, additional_client_ids = [] } = req.body;

    // Asumimos que validateSchema(createDashboardSchema) ya corrió antes de este controller

    const newDashboard = await DashboardService.createDashboard({
      name: name.trim(),
      description: description.trim(),
      client_id,
      additional_client_ids,
    });

    return res.status(201).json({
      status: 'success',
      data: { dashboard: newDashboard },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/dashboard/:client_id
 * Recupera todos los dashboards donde client_id es dueño o está en additional_client_ids.
 */
exports.getDashboardsByClientId = async (req, res, next) => {
  try {
    const { client_id } = req.params;
    // Asumimos validateSchema(getDashboardsSchema, 'params') antes de este controller

    const dashboards = await DashboardService.fetchDashboardsByClientId(client_id);
    if (!dashboards || dashboards.length === 0) {
      return next(new AppError('No se encontraron dashboards para este cliente', 404));
    }

    return res.status(200).json({
      status: 'success',
      results: dashboards.length,
      data: { dashboards },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PUT /api/dashboard
 * Actualiza nombre, descripción y additional_client_ids de un dashboard existente.
 */
exports.updateDashboard = async (req, res, next) => {
  try {
    const { dashboard_id, name, description, additional_client_ids = [] } = req.body;
    // Asumimos validateSchema(updateDashboardSchema) antes de este controller

    const updated = await DashboardService.updateDashboard({
      dashboard_id,
      name: name.trim(),
      description: description.trim(),
      additional_client_ids,
    });

    if (!updated) {
      return next(new AppError('Dashboard no encontrado', 404));
    }

    return res.status(200).json({ status: 'success', message: 'Dashboard actualizado correctamente' });
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
    // Asumimos validateSchema(deleteDashboardSchema, 'params') antes de este controller

    const result = await DashboardService.deleteDashboard(dashboard_id);
    if (result === 'not_found') {
      return next(new AppError('Dashboard no encontrado', 404));
    }

    return res.status(200).json({ status: 'success', message: 'Dashboard y widgets eliminados correctamente' });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/dashboard/assign
 * Asigna un cliente a additional_client_ids de un dashboard.
 */
exports.assignDashboardToClient = async (req, res, next) => {
  try {
    const { clientId, dashboardId } = req.body;
    // Asumimos validateSchema(assignDashboardSchema) antes de este controller

    const assignResult = await DashboardService.assignDashboardToClient(clientId, dashboardId);

    if (assignResult === 'not_found') {
      return next(new AppError('Dashboard no encontrado', 404));
    }
    if (assignResult === 'already_assigned') {
      return res
        .status(200)
        .json({ status: 'success', message: 'Client ya estaba asignado a este dashboard' });
    }

    // assignResult contiene el dashboard actualizado
    return res
      .status(200)
      .json({ status: 'success', message: 'Dashboard asignado correctamente', data: { dashboard: assignResult } });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
