// backend/schemas/dashboardSchemas.js
const Joi = require('joi');

exports.createDashboardSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(255).required(),
  client_id: Joi.number().integer().required(),
  additional_client_ids: Joi.array().items(Joi.number().integer()).default([]),
});

exports.getDashboardsSchema = Joi.object({
  client_id: Joi.number().integer().required(),
});

exports.updateDashboardSchema = Joi.object({
  dashboard_id: Joi.number().integer().required(),
  name: Joi.string().max(100).required(),
  description: Joi.string().max(255).required(),
  additional_client_ids: Joi.array().items(Joi.number().integer()).default([]),
});

exports.deleteDashboardSchema = Joi.object({
  dashboard_id: Joi.number().integer().required(),
});

exports.assignDashboardSchema = Joi.object({
  clientId: Joi.number().integer().required(),
  dashboardId: Joi.number().integer().required(),
});
