// backend/schemas/entitySchemas.js
const Joi = require('joi');

exports.getEntitiesSchema = Joi.object({
  client_id: Joi.number().integer().required(),
});

exports.getEntityByIdSchema = Joi.object({
  entity_id: Joi.number().integer().required(),
});

exports.createEntitySchema = Joi.object({
  client_id: Joi.number().integer().required(),
  name: Joi.string().max(100).required(),
  datasource_type: Joi.string().valid('mqtt', 'api').required(),
  datasource_config: Joi.alternatives().conditional('datasource_type', {
    is: 'mqtt',
    then: Joi.object({
      sub_topic: Joi.string().required(),
      pub_topic: Joi.string().required(),
      heartbeat_timeout_s: Joi.number().positive().optional(),
      data_key: Joi.string().optional(),
    }).required(),
    otherwise: Joi.object({
      base_url: Joi.string().uri().required(),
      method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
      polling_interval_ms: Joi.number().integer().optional(),
      query_params: Joi.object().optional(),
      headers: Joi.object().optional(),
      request_body: Joi.object().optional(),
      data_key: Joi.string().optional(),
    }).required(),
  }),
  rulechain_id: Joi.number().integer().optional().default(0),
});

exports.updateEntitySchema = Joi.object({
  entity_id: Joi.number().integer().required(),
  name: Joi.string().max(100).required(),
  datasource_config: Joi.object({
    sub_topic: Joi.string(), pub_topic: Joi.string(), heartbeat_timeout_s: Joi.number().positive(),
    request_topic: Joi.string(), heartbeat_topic: Joi.string(), source_of_truth: Joi.string().valid('platform','device'),
    base_url: Joi.string().uri(), method: Joi.string().valid('GET','POST','PUT','DELETE'),
    polling_interval_ms: Joi.number().positive(), data_key: Joi.string(),
    query_params: Joi.object(), headers: Joi.object(), request_body: Joi.object(),
  }).unknown(false).required(),
  rulechain_id: Joi.number().integer().optional().default(0),
});

exports.deleteEntitySchema = Joi.object({
  entity_id: Joi.number().integer().required(),
});

exports.updateEntityRulechainSchema = Joi.object({
  entity_id: Joi.number().integer().required(),
  rulechain: Joi.object().required(),
});
// Resource schema metadata.
for (const name of Object.keys(exports)) exports[name] = exports[name].meta({ resource: 'entity' });
