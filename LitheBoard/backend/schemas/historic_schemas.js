// backend/schemas/historicSchemas.js
const Joi = require('joi');

exports.getHistoricsByEntitySchema = Joi.object({
  entity_id: Joi.number().integer().required(),
});

exports.getHistoricByClientSchema = Joi.object({
  client_id: Joi.number().integer().required(),
});

exports.createHistoricSchema = Joi.object({
  entity_id: Joi.number().integer().required(),
  date: Joi.date().iso().required(),
  data: Joi.alternatives().try(Joi.object(), Joi.string()).required(),
  client_id: Joi.number().integer().required(),
  selected_key: Joi.string().required(),
});
