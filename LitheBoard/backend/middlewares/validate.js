// backend/middlewares/validate.js
const AppError = require('../utils/app_error');

/**
 * validateSchema(schema, location) 
 *  - schema: esquema Joi
 *  - location: 'body' (default), 'params', 'query'
 */
exports.validateSchema = (schema, location = 'body') => (req, res, next) => {
  const data = req[location];
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return next(new AppError(messages.join('. '), 400));
  }
  // Reemplazamos req.body / req.params / req.query por los valores validados y saneados
  req[location] = value;
  next();
};
