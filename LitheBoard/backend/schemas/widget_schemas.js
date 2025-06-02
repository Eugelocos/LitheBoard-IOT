// backend/schemas/widgetSchemas.js
const Joi = require('joi');

exports.getWidgetsWithEntitiesSchema = Joi.object({
  client_id: Joi.number().integer().required().messages({
    'any.required': 'client_id es requerido',
    'number.base': 'client_id debe ser un número entero',
  }),
  dashboard_id: Joi.number().integer().required().messages({
    'any.required': 'dashboard_id es requerido',
    'number.base': 'dashboard_id debe ser un número entero',
  }),
});

exports.getWidgetByIdSchema = Joi.object({
  widget_id: Joi.number().integer().required().messages({
    'any.required': 'widget_id es requerido',
    'number.base': 'widget_id debe ser un número entero',
  }),
});

exports.createWidgetSchema = Joi.object({
  widget_name: Joi.string().max(100).required(),
  entity_id: Joi.number().integer().required(),
  dashboard_id: Joi.number().integer().required(),
  widget_type: Joi.string().max(50).required(),
  config_data: Joi.object().required(),
  client_id: Joi.number().integer().required(),
});

exports.updateWidgetSchema = Joi.object({
  widget_id: Joi.number().integer().required(),
  widget_name: Joi.string().max(100).required(),
  entity_id: Joi.number().integer().required(),
  dashboard_id: Joi.number().integer().required(),
  widget_type: Joi.string().max(50).required(),
  config_data: Joi.object().required(),
});

exports.deleteWidgetSchema = Joi.object({
  widget_id: Joi.number().integer().required(),
});
