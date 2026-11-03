// backend/controllers/api/notification_controller.js

const AppError = require('../../utils/app_error');
const NotificationService = require('../../services/notification_service');
const { assertOwnership } = require('../../utils/authorization');
const { sendSuccess, sendCollection } = require('../../utils/response');

/**
 * GET /api/notification/:client_id
 * Recupera todas las notificaciones asociadas a un client_id.
 */
exports.getNotificationsByClientId = async (req, res, next) => {
  try {
    const { client_id } = req.params;

    assertOwnership(req.user, client_id, 'listado de notificaciones');

    const notifications = await NotificationService.fetchByClientId(client_id);
    return sendCollection(res, 'notifications', notifications);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/notification
 * Inserta una nueva notificación en la tabla `notifications`.
 */
exports.insertNotification = async (req, res, next) => {
  try {
    const { alarm_id, client_id, created_at, value } = req.body;

    assertOwnership(req.user, client_id, 'cliente');

    const notification = await NotificationService.createNotification({ alarm_id, client_id, created_at, value });

    return sendSuccess(res, 201, { notification });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PATCH /api/notification/:notification_id/read
 * Marca una notificación como leída y la devuelve actualizada.
 */
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { notification_id } = req.params;

    const existing = await NotificationService.fetchById(notification_id);
    if (!existing) {
      return next(new AppError('Notificación no encontrada', 404, 'NOTIFICATION_NOT_FOUND'));
    }
    assertOwnership(req.user, existing.client_id, 'notificación');

    await NotificationService.markAsRead(notification_id);
    const notification = await NotificationService.fetchById(notification_id);

    return sendSuccess(res, 200, { notification });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
