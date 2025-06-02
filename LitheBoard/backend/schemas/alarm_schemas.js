// backend/schemas/alarmSchemas.js
const Joi = require('joi');

// Validación para GET /api/alarm/:client_id
exports.getAlarmsSchema = Joi.object({
  client_id: Joi.number().integer().required()
});

// Validación para POST /api/alarm
exports.createAlarmSchema = Joi.object({
  entity_id: Joi.number().integer().required(),
  valor: Joi.number().required(),
  client_id: Joi.number().integer().required(),
  selected_key: Joi.string().max(100).required(),
  alarm_condition: Joi.string().valid('>', '<').required()
});
