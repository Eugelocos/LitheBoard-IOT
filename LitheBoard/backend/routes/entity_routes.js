// backend/routes/entity_routes.js
const express = require('express');
const router = express.Router();
const entityController = require('../controllers/api/entity_controller');
const { protect, restrictTo } = require('../middlewares/auth');
const { validateSchema } = require('../middlewares/validate');
const {
  getEntitiesSchema,
  getEntityByIdSchema,
  createEntitySchema,
  updateEntitySchema,
  deleteEntitySchema,
  updateEntityRulechainSchema,
} = require('../schemas/entity_schemas');

// Obtener todas las entidades de un client_id
router.get(
  '/',
  protect,
  validateSchema(getEntitiesSchema, 'query'),
  entityController.getEntities
);

// Insertar nueva entidad
router.post(
  '/',
  protect,
  restrictTo('admin', 'manager'),
  validateSchema(createEntitySchema),
  entityController.insertEntity
);

// Obtener entidad por ID
router.get(
  '/:entity_id',
  protect,
  validateSchema(getEntityByIdSchema, 'params'),
  entityController.getEntityById
);

// Actualizar entidad
router.put(
  '/',
  protect,
  restrictTo('admin'),
  validateSchema(updateEntitySchema),
  entityController.updateEntity
);

// Eliminar entidad
router.delete(
  '/:entity_id',
  protect,
  restrictTo('admin'),
  validateSchema(deleteEntitySchema, 'params'),
  entityController.deleteEntity
);

// Actualizar sólo el campo rulechain de datasource_config
router.patch(
  '/:entity_id/rulechain',
  protect,
  restrictTo('admin'),
  validateSchema(updateEntityRulechainSchema),
  entityController.updateEntityRulechain
);

module.exports = router;
