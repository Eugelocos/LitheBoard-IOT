// backend/schemas/alarmSchemas.js
const Joi = require('joi');

// Validación para GET /api/alarm/:client_id
exports.getAlarmsSchema = Joi.object({
  client_id: Joi.number().integer().required()
});

// Validación para POST /api/alarm
exports.createAlarmSchema = Joi.object({
  entity_id: Joi.number().integer().required(),
  threshold: Joi.number().required(),
  client_id: Joi.number().integer().required(),
  data_key: Joi.string().max(100).required(),
  operator: Joi.string().valid('greater_than', 'less_than').required()
});

exports.alarmIdSchema = Joi.object({ alarm_id: Joi.number().integer().positive().required() });
exports.updateAlarmSchema = exports.createAlarmSchema.fork(['client_id'], (schema) => schema.forbidden());

// Resource schema metadata.
for (const name of Object.keys(exports)) exports[name] = exports[name].meta({ resource: 'alarm' });
