// backend/routes/historic_routes.js
const express = require('express');
const router = express.Router();
const historicController = require('../controllers/api/historic_controller');
const { protect, restrictTo } = require('../middlewares/auth');
const { validateSchema } = require('../middlewares/validate');
const {
  getHistoricsByEntitySchema,
  getHistoricByClientSchema,
  createHistoricSchema,
} = require('../schemas/historic_schemas');

// Obtener historiales por entity_id
router.get(
  '/entity/:entity_id',
  protect,
  validateSchema(getHistoricsByEntitySchema, 'params'),
  historicController.getHistoricsByEntityId
);

// Obtener historiales por client_id
router.get(
  '/client/:client_id',
  protect,
  validateSchema(getHistoricByClientSchema, 'params'),
  historicController.getHistoricByClientId
);

// Insertar histórico
router.post(
  '/',
  protect,
  restrictTo('admin', 'manager'),
  validateSchema(createHistoricSchema),
  historicController.insertHistoric
);

module.exports = router;
