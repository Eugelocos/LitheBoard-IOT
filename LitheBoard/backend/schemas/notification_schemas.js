// backend/schemas/notificationSchemas.js
const Joi = require('joi');

exports.getNotificationsSchema = Joi.object({
  client_id: Joi.number().integer().required(),
});

exports.createNotificationSchema = Joi.object({
  alarm_id: Joi.number().integer().required(),
  client_id: Joi.number().integer().required(),
  created_at: Joi.date().iso().required(),
  value: Joi.any().required(),
});

exports.markNotificationAsReadSchema = Joi.object({
  notification_id: Joi.number().integer().required(),
});

// Resource schema metadata.
for (const name of Object.keys(exports)) exports[name] = exports[name].meta({ resource: 'notification' });
