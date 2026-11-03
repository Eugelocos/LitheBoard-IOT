// backend/middlewares/error_handler.js
const { sendError } = require('../utils/response');

module.exports = (err, req, res, next) => {
  // JSON mal formado en el cuerpo (lo lanza body-parser).
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, { code: 'INVALID_JSON', message: 'El cuerpo de la petición no es JSON válido.' });
  }

  if (err.isOperational) {
    return sendError(res, err.statusCode, {
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Error de programación: se registra completo y no se filtra al cliente.
  console.error(err);
  return sendError(res, 500, { code: 'INTERNAL_ERROR', message: 'Internal server error' });
};
