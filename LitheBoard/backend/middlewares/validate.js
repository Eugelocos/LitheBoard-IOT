// backend/middlewares/validate.js
const AppError = require('../utils/app_error');

/**
 * validateSchema(schema, location)
 *  - schema: esquema Joi
 *  - location: 'body' (default), 'params', 'query'
 *
 * Si falla, responde 400 VALIDATION_ERROR con un detalle por campo.
 */
exports.validateSchema = (schema, location = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[location], { abortEarly: false, stripUnknown: false, allowUnknown: false });
  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      issue: d.type,
      message: d.message,
    }));
    const message = details.map((d) => d.message).join('. ');
    return next(new AppError(message, 400, 'VALIDATION_ERROR', details));
  }
  // Reemplazamos req.body / req.params / req.query por los valores validados y saneados
  req[location] = value;
  next();
};
