// backend/routes/widget_routes.js
const express = require('express');
const router = express.Router();
const widgetController = require('../controllers/api/widget_controller');
const { protect, restrictTo } = require('../middlewares/auth');
const { validateSchema } = require('../middlewares/validate');
const {
  getWidgetsWithEntitiesSchema,
  getWidgetByIdSchema,
  createWidgetSchema,
  updateWidgetSchema,
  deleteWidgetSchema,
} = require('../schemas/widget_schemas');

// Obtener widgets con entidades por client_id y dashboard_id
router.get(
  '/:client_id/:dashboard_id',
  protect,
  validateSchema(getWidgetsWithEntitiesSchema, 'params'),
  widgetController.getWidgetsWithEntities
);

// Obtener widget por ID
router.get(
  '/:widget_id',
  protect,
  validateSchema(getWidgetByIdSchema, 'params'),
  widgetController.getWidgetById
);

// Obtener todos los widgets
router.get('/', protect, widgetController.getWidgets);

// Crear nuevo widget
router.post(
  '/',
  protect,
  restrictTo('admin', 'manager'),
  validateSchema(createWidgetSchema),
  widgetController.insertWidget
);

// Actualizar widget
router.put(
  '/:widget_id',
  protect,
  restrictTo('admin', 'manager'),
  validateSchema(updateWidgetSchema),
  widgetController.updateWidget
);

// Eliminar widget
router.delete(
  '/:widget_id',
  protect,
  restrictTo('admin'),
  validateSchema(deleteWidgetSchema, 'params'),
  widgetController.deleteWidget
);

module.exports = router;
