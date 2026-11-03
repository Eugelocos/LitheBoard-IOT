// backend/utils/app_error.js

// Código estable por defecto para cada estado HTTP. El frontend decide con
// `error.code`, nunca con el texto de `message`.
const DEFAULT_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  500: 'INTERNAL_ERROR',
};

class AppError extends Error {
  /**
   * @param {string} message Texto para personas.
   * @param {number} statusCode Estado HTTP.
   * @param {string} [code] Código estable en UPPER_SNAKE_CASE.
   * @param {Array<{ field: string, issue: string, message?: string }>} [details]
   */
  constructor(message, statusCode, code, details = []) {
    super(message);

    this.statusCode = statusCode;
    this.code = code || DEFAULT_CODES[statusCode] || 'INTERNAL_ERROR';
    this.details = details;
    this.isOperational = true; // Marca errores esperados vs. errores de programación

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
