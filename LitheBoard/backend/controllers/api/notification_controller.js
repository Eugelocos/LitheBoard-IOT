// backend/controllers/api/notification_controller.js

const AppError = require('../../utils/app_error');
const NotificationService = require('../../services/notification_service');

/**
 * GET /api/notification/:client_id
 * Recupera todas las notificaciones asociadas a un client_id.
 */
exports.getNotificationsByClientId = async (req, res, next) => {
  try {
    const { client_id } = req.params;
    // Se asume validateSchema(getNotificationsSchema, 'params') antes de este controller

    const notifications = await NotificationService.fetchByClientId(client_id);
    if (!notifications.length) {
      return next(new AppError('No se encontraron notificaciones para este cliente.', 404));
    }

    return res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications },
    });
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
    const { alarm_id, client_id, date, data } = req.body;
    // Se asume validateSchema(createNotificationSchema) antes de este controller

    const newNotification = await NotificationService.createNotification({ alarm_id, client_id, date, data });

    return res.status(201).json({
      status: 'success',
      data: { notification: newNotification },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PATCH /api/notification/:notification_id/read
 * Marca una notificación como leída (visto = 1).
 */
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { notification_id } = req.params;
    // Se asume validateSchema(markNotificationAsReadSchema, 'params') antes de este controller

    await NotificationService.markAsRead(notification_id);

    return res.status(200).json({
      status: 'success',
      message: 'Notificación marcada como leída.',
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
