// backend/schemas/rulechainSchemas.js
const Joi = require('joi');

exports.getRulechainsSchema = Joi.object({
  client_id: Joi.number().integer().required().messages({
    'any.required': 'client_id es requerido',
    'number.base': 'client_id debe ser un número entero',
  }),
});

exports.getRulechainByIdSchema = Joi.object({
  rulechain_id: Joi.number().integer().required().messages({
    'any.required': 'rulechain_id es requerido',
    'number.base': 'rulechain_id debe ser un número entero',
  }),
});

exports.createRulechainSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    'any.required': 'user_id es requerido',
    'number.base': 'user_id debe ser un número entero',
  }),
  name: Joi.string().max(100).required(),
  description: Joi.string().max(255).allow('', null),
  rulechain: Joi.object({
    nodes: Joi.array().items(Joi.object()).min(1).required(),
    edges: Joi.array().items(Joi.object()).required(),
  }).required(),
  entities_ids: Joi.array().items(Joi.number().integer()).min(1).required(),
});

exports.updateRulechainSchema = Joi.object({
  rulechain_id: Joi.number().integer().required(),
  name: Joi.string().max(100).required(),
  description: Joi.string().max(255).allow('', null),
  rulechain: Joi.object({
    nodes: Joi.array().items(Joi.object()).min(1).required(),
    edges: Joi.array().items(Joi.object()).required(),
  }).required(),
  entities_ids: Joi.array().items(Joi.number().integer()).min(1).required(),
});

exports.deleteRulechainSchema = Joi.object({
  rulechain_id: Joi.number().integer().required(),
});
