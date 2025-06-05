// backend/routes/rulechain_routes.js
const express = require('express');
const router = express.Router();
const rulechainController = require('../controllers/api/rulechain_controller');
const { protect, restrictTo } = require('../middlewares/auth');
const { validateSchema } = require('../middlewares/validate');
const {
  getRulechainsSchema,
  getRulechainByIdSchema,
  createRulechainSchema,
  updateRulechainSchema,
  deleteRulechainSchema,
} = require('../schemas/rulechain_schemas');

// Obtener rulechains por client_id
router.get(
  '/',
  protect,
  validateSchema(getRulechainsSchema, 'query'),
  rulechainController.getRulechains
);

// Obtener un rulechain por ID
router.get(
  '/:rulechain_id',
  protect,
  validateSchema(getRulechainByIdSchema, 'params'),
  rulechainController.getRulechainById
);

// Crear nuevo rulechain
router.post(
  '/',
  protect,
  restrictTo('admin', 'manager'),
  validateSchema(createRulechainSchema),
  rulechainController.insertRulechain
);

// Actualizar rulechain
router.put(
  '/',
  protect,
  restrictTo('admin', 'manager'),
  validateSchema(updateRulechainSchema),
  rulechainController.updateRulechain
);

// Eliminar rulechain
router.delete(
  '/:rulechain_id',
  protect,
  restrictTo('admin'),
  validateSchema(deleteRulechainSchema, 'params'),
  rulechainController.deleteRulechain
);

module.exports = router;
