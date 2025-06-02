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
  disp_name: Joi.string().max(100).required(),
  datasource_type: Joi.string().valid('MQTT', 'API').required(),
  datasource_config: Joi.alternatives().conditional('datasource_type', {
    is: 'MQTT',
    then: Joi.object({
      sub_topic: Joi.string().required(),
      pub_topic: Joi.string().required(),
      data_key: Joi.string().optional(),
    }).required(),
    otherwise: Joi.object({
      base_url: Joi.string().uri().required(),
      endpoint: Joi.string().required(),
      method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
      polling_interval: Joi.number().integer().optional(),
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
  disp_name: Joi.string().max(100).required(),
  datasource_config: Joi.object().required(),
  rulechain_id: Joi.number().integer().optional().default(0),
});

exports.deleteEntitySchema = Joi.object({
  entity_id: Joi.number().integer().required(),
});

exports.updateEntityRulechainSchema = Joi.object({
  entity_id: Joi.number().integer().required(),
  rulechain: Joi.object().required(),
});
