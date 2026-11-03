// backend/routes/client_routes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/api/client_controller');
const { protect, restrictTo } = require('../middlewares/auth');
const { validateSchema } = require('../middlewares/validate');
const {
  loginSchema,
  registerSchema,
  updateSchema,
  getAssociatedClientsSchema,
  getClientsByIdsSchema,
  deleteSchema,
} = require('../schemas/client_schemas');

// Login
router.post(
  '/login', 
  validateSchema(loginSchema), 
  clientController.login
);

// Obtener sesión (opcionalmente protegido)
router.get(
  '/session', 
  protect, 
  clientController.getUserSession
);

// Logout (JWT puro no requiere destruir sesión en servidor)
router.post(
  '/logout', 
  protect, 
  clientController.logout
);

// Register
router.post(
  '/register', 
  validateSchema(registerSchema), 
  clientController.register
);

// Actualizar cliente
router.put(
  '/', 
  protect, 
  validateSchema(updateSchema), 
  clientController.updateClient
);

// Obtener clientes asociados a un admin
router.get(
  '/admins/:admin_client_id/clients',
  protect,
  restrictTo('admin'), // Solo admins pueden ver sus clientes
  validateSchema(getAssociatedClientsSchema, 'params'),
  clientController.getAsociatedClientsAdminsByAdminId
);

// Obtener clientes por IDs
router.get(
  '/:clients_ids',
  protect,
  restrictTo('admin'),
  validateSchema(getClientsByIdsSchema, 'params'),
  clientController.getClientsByIds
);

// Eliminar cliente
router.delete(
  '/:client_id',
  protect,
  restrictTo('admin'),
  validateSchema(deleteSchema, 'params'),
  clientController.deleteClient
);

module.exports = router;
