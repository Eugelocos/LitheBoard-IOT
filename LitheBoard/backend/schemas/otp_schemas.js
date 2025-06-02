// backend/schemas/otpSchemas.js
const Joi = require('joi');

exports.requestOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

exports.verifyOtpSchema = Joi.object({
  client_id: Joi.number().integer().required(),
  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({ 'string.pattern.base': 'OTP debe tener 6 dígitos numéricos' }),
});
