// backend/controllers/api/widget_controller.js

const AppError = require('../../utils/appError');
const WidgetService = require('../../services/dbServices/widget_service');

/**
 * GET /api/widget/:client_id/:dashboard_id
 * Recupera widgets con entidades asociadas para un client_id y dashboard_id.
 */
exports.getWidgetsWithEntities = async (req, res, next) => {
  try {
    const { client_id, dashboard_id } = req.params;
    // Se asume validateSchema(getWidgetsWithEntitiesSchema, 'params') antes de este controlador

    const widgets = await WidgetService.fetchWidgetsWithEntities(client_id, dashboard_id);
    return res.status(200).json({
      status: 'success',
      results: widgets.length,
      data: { widgets },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/widget/:widget_id
 * Recupera un widget por su ID.
 */
exports.getWidgetById = async (req, res, next) => {
  try {
    const { widget_id } = req.params;
    // Se asume validateSchema(getWidgetByIdSchema, 'params') antes de este controlador

    const widget = await WidgetService.fetchById(widget_id);
    if (!widget) {
      return next(new AppError('Widget no encontrado', 404));
    }
    return res.status(200).json({
      status: 'success',
      data: { widget },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/widget
 * Recupera todos los widgets.
 */
exports.getWidgets = async (_req, res, next) => {
  try {
    const widgets = await WidgetService.fetchAll();
    return res.status(200).json({
      status: 'success',
      results: widgets.length,
      data: { widgets },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/widget
 * Inserta un nuevo widget.
 */
exports.insertWidget = async (req, res, next) => {
  try {
    const { widget_name, entity_id, dashboard_id, widget_type, config_data, client_id } = req.body;
    // Se asume validateSchema(createWidgetSchema) antes de este controlador

    const newWidget = await WidgetService.createWidget({
      widget_name,
      entity_id,
      dashboard_id,
      widget_type,
      config_data,
      client_id,
    });

    return res.status(201).json({
      status: 'success',
      data: { widget: newWidget },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PUT /api/widget/:widget_id
 * Actualiza un widget existente.
 */
exports.updateWidget = async (req, res, next) => {
  try {
    const { widget_id } = req.params;
    const { widget_name, entity_id, dashboard_id, widget_type, config_data } = req.body;
    // Se asume validateSchema(updateWidgetSchema) antes de este controlador

    await WidgetService.updateWidget(widget_id, {
      widget_name,
      entity_id,
      dashboard_id,
      widget_type,
      config_data,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Widget actualizado correctamente',
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * DELETE /api/widget/:widget_id
 * Elimina un widget por su ID.
 */
exports.deleteWidget = async (req, res, next) => {
  try {
    const { widget_id } = req.params;
    // Se asume validateSchema(deleteWidgetSchema, 'params') antes de este controlador

    const deleted = await WidgetService.deleteWidget(widget_id);
    if (!deleted) {
      return next(new AppError('Widget no encontrado', 404));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Widget eliminado correctamente',
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
