// backend/routes/notification_routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/api/notification_controller');
const { protect, restrictTo } = require('../middlewares/auth');
const { validateSchema } = require('../middlewares/validate');
const {
  getNotificationsSchema,
  createNotificationSchema,
  markNotificationAsReadSchema,
} = require('../schemas/notificationSchemas');

// Obtener notificaciones por client_id
router.get(
  '/:client_id',
  protect,
  validateSchema(getNotificationsSchema, 'params'),
  notificationController.getNotificationsByClientId
);

// Crear notificación
router.post(
  '/',
  protect,
  restrictTo('admin', 'manager'),
  validateSchema(createNotificationSchema),
  notificationController.insertNotification
);

// Marcar notificación como leída
router.patch(
  '/:notification_id/read',
  protect,
  validateSchema(markNotificationAsReadSchema, 'params'),
  notificationController.markNotificationAsRead
);

module.exports = router;
