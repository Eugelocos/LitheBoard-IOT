// backend/utils/app_error.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Marca errores esperados vs. errores de programación

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
