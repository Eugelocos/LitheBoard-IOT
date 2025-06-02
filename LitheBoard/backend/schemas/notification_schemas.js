// backend/schemas/notificationSchemas.js
const Joi = require('joi');

exports.getNotificationsSchema = Joi.object({
  client_id: Joi.number().integer().required(),
});

exports.createNotificationSchema = Joi.object({
  alarm_id: Joi.number().integer().required(),
  client_id: Joi.number().integer().required(),
  date: Joi.date().iso().required(),
  data: Joi.alternatives().try(Joi.object(), Joi.string()).required(),
});

exports.markNotificationAsReadSchema = Joi.object({
  notification_id: Joi.number().integer().required(),
});
