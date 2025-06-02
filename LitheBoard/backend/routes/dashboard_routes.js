// backend/routes/dashboard_routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/api/dashboard_controller');
const { protect, restrictTo } = require('../middlewares/auth');
const { validateSchema } = require('../middlewares/validate');
const {
  createDashboardSchema,
  getDashboardsSchema,
  updateDashboardSchema,
  deleteDashboardSchema,
  assignDashboardSchema,
} = require('../schemas/dashboardSchemas');

// Insertar dashboard
router.post(
  '/',
  protect,
  restrictTo('admin', 'manager'),
  validateSchema(createDashboardSchema),
  dashboardController.insertDashboard
);

// Obtener dashboards por client_id
router.get(
  '/:client_id',
  protect,
  validateSchema(getDashboardsSchema, 'params'),
  dashboardController.getDashboardsByClientId
);

// Actualizar dashboard
router.put(
  '/',
  protect,
  restrictTo('admin', 'manager'),
  validateSchema(updateDashboardSchema),
  dashboardController.updateDashboard
);

// Eliminar dashboard
router.delete(
  '/:dashboard_id',
  protect,
  restrictTo('admin'),
  validateSchema(deleteDashboardSchema, 'params'),
  dashboardController.deleteDashboard
);

// Asignar dashboard a cliente
router.post(
  '/assign',
  protect,
  restrictTo('admin'),
  validateSchema(assignDashboardSchema),
  dashboardController.assignDashboardToClient
);

module.exports = router;
