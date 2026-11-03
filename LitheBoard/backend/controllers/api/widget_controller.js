// backend/controllers/api/widget_controller.js

const AppError = require('../../utils/app_error');
const WidgetService = require('../../services/dbServices/widget_service');
const { assertOwnership } = require('../../utils/authorization');
const { sendSuccess, sendCollection, sendNoContent } = require('../../utils/response');

const widgetNotFound = () => new AppError('Widget no encontrado', 404, 'WIDGET_NOT_FOUND');

/**
 * GET /api/widget/:client_id/:dashboard_id
 * Recupera widgets con entidades asociadas para un client_id y dashboard_id.
 */
exports.getWidgetsWithEntities = async (req, res, next) => {
  try {
    const { client_id, dashboard_id } = req.params;

    // FIX S-02
    assertOwnership(req.user, client_id, 'listado de widgets');

    const widgets = await WidgetService.fetchWidgetsWithEntities(client_id, dashboard_id);
    return sendCollection(res, 'widgets', widgets);
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

    const widget = await WidgetService.fetchById(widget_id);
    if (!widget) return next(widgetNotFound());

    // FIX S-02
    assertOwnership(req.user, widget.client_id, 'widget');

    return sendSuccess(res, 200, { widget });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/widget
 * Recupera los widgets del usuario autenticado.
 *
 * FIX CRÍTICO: antes devolvía WidgetService.fetchAll(), es decir, TODOS los
 * widgets de TODOS los clientes de la plataforma sin ningún filtro. Ahora
 * se escopea siempre a la cuenta del usuario autenticado.
 */
exports.getWidgets = async (req, res, next) => {
  try {
    const widgets = await WidgetService.fetchAllByClientId(req.user.client_id);
    return sendCollection(res, 'widgets', widgets);
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
    const { name, entity_id, dashboard_id, widget_type, widget_config, client_id } = req.body;

    assertOwnership(req.user, client_id, 'cliente');

    const widget = await WidgetService.createWidget({
      name,
      entity_id,
      dashboard_id,
      widget_type,
      widget_config,
      client_id,
    });

    return sendSuccess(res, 201, { widget });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PUT /api/widget/:widget_id
 * Actualiza un widget existente y lo devuelve actualizado.
 */
exports.updateWidget = async (req, res, next) => {
  try {
    const { widget_id } = req.params;
    const { name, entity_id, dashboard_id, widget_type, widget_config } = req.body;

    const existing = await WidgetService.fetchById(widget_id);
    if (!existing) return next(widgetNotFound());
    assertOwnership(req.user, existing.client_id, 'widget');

    await WidgetService.updateWidget(widget_id, {
      name,
      entity_id,
      dashboard_id,
      widget_type,
      widget_config,
    });

    const widget = await WidgetService.fetchById(widget_id);
    return sendSuccess(res, 200, { widget });
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

    const existing = await WidgetService.fetchById(widget_id);
    if (!existing) return next(widgetNotFound());
    assertOwnership(req.user, existing.client_id, 'widget');

    const deleted = await WidgetService.deleteWidget(widget_id);
    if (!deleted) return next(widgetNotFound());

    return sendNoContent(res);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
