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
  name: Joi.string().max(100).required(),
  entity_id: Joi.number().integer().required(),
  dashboard_id: Joi.number().integer().required(),
  widget_type: Joi.string().valid('switch', 'line_chart', 'bar_chart', 'map', 'custom_value_card').required(),
  widget_config: Joi.object({ data_key: Joi.string(), is_on: Joi.boolean(), message_on: Joi.any(), message_off: Joi.any(), lat: Joi.alternatives().try(Joi.number(), Joi.string()), lon: Joi.alternatives().try(Joi.number(), Joi.string()), line_color: Joi.string(), html_template: Joi.string(), css: Joi.string() }).unknown(false).required(),
  client_id: Joi.number().integer().required(),
});

exports.updateWidgetSchema = Joi.object({
  widget_id: Joi.number().integer().required(),
  name: Joi.string().max(100).required(),
  entity_id: Joi.number().integer().required(),
  dashboard_id: Joi.number().integer().required(),
  widget_type: Joi.string().valid('switch', 'line_chart', 'bar_chart', 'map', 'custom_value_card').required(),
  widget_config: Joi.object({ data_key: Joi.string(), is_on: Joi.boolean(), message_on: Joi.any(), message_off: Joi.any(), lat: Joi.alternatives().try(Joi.number(), Joi.string()), lon: Joi.alternatives().try(Joi.number(), Joi.string()), line_color: Joi.string(), html_template: Joi.string(), css: Joi.string() }).unknown(false).required(),
});

exports.deleteWidgetSchema = Joi.object({
  widget_id: Joi.number().integer().required(),
});

// Resource schema metadata.
for (const name of Object.keys(exports)) exports[name] = exports[name].meta({ resource: 'widget' });
