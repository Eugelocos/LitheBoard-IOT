// backend/schemas/clientSchemas.js
const Joi = require('joi');

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

exports.registerSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
  access_level: Joi.string().valid('1', '2', '3').required(), 
  adminEmail: Joi.string().email().optional().allow('', null),
});

exports.updateSchema = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
});

exports.getAssociatedClientsSchema = Joi.object({
  admin_id: Joi.number().integer().required(),
});

exports.getClientsByIdsSchema = Joi.object({
  clients_ids: Joi.string()
    .pattern(/^\d+(,\d+)*$/)
    .required()
    .messages({
      'string.pattern.base': 'clients_ids debe ser una lista de números separados por comas, p. ej. "1,2,3"',
    }),
});

exports.deleteSchema = Joi.object({
  client_id: Joi.number().integer().required(),
});
