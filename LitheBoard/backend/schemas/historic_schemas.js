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
  recorded_at: Joi.date().iso().required(),
  data: Joi.any().required(),
  client_id: Joi.number().integer().required(),
  data_key: Joi.string().required(),
});

// Resource schema metadata.
for (const name of Object.keys(exports)) exports[name] = exports[name].meta({ resource: 'historic' });
