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
  role: Joi.string().valid('admin', 'client', 'manager').required(),
  admin_email: Joi.string().email().optional().allow('', null),
});

exports.updateSchema = Joi.object({
  client_id: Joi.number().integer().required(),
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
});

exports.getAssociatedClientsSchema = Joi.object({
  admin_client_id: Joi.number().integer().required(),
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

// Resource schema metadata.
for (const name of Object.keys(exports)) exports[name] = exports[name].meta({ resource: 'client' });
