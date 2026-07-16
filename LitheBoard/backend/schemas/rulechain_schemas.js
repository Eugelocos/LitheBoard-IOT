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
  name: Joi.string().max(100).required().messages({
    'any.required': 'name es requerido',
    'string.max': 'name no puede exceder 100 caracteres',
  }),
  description: Joi.string().max(255).allow('', null).default(''),
  rulechain: Joi.object({
    nodes: Joi.array().items(Joi.object()).min(1).required(),
    edges: Joi.array().items(Joi.object()).default([]),
  }).required().default({ nodes: [], edges: [] }),
  entities_ids: Joi.array().items(Joi.number().integer()).optional().default([]),
});

exports.updateRulechainSchema = Joi.object({
  rulechain_id: Joi.number().integer().required(),
  name: Joi.string().max(100).optional(),
  description: Joi.string().max(255).allow('', null).optional(),
  rulechain: Joi.object({
    nodes: Joi.array().items(Joi.object()).default([]),
    edges: Joi.array().items(Joi.object()).default([]),
  }).required(),
  entities_ids: Joi.array().items(Joi.number().integer()).optional().default([]),
})
// Al menos un campo adicional debe ser actualizado (excepto rulechain_id)
.custom((value, helpers) => {
  const { rulechain_id, ...updates } = value;
  if (Object.keys(updates).length === 0) {
    return helpers.error('any.required', { 
      message: 'Se requiere al menos un campo para actualizar' 
    });
  }
  return value;
});

exports.deleteRulechainSchema = Joi.object({
  rulechain_id: Joi.number().integer().required(),
});
