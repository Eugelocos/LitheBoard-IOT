// backend/utils/response.js
//
// Envoltorio único de respuestas HTTP (docs/CONVENCIONES_Y_CONTRATOS.md §5).
// Todas las respuestas con cuerpo tienen la forma:
//   { status: "success" | "error", data, meta?, error }
// Los controladores no deben llamar a res.json() directamente.

/**
 * Responde con éxito.
 * @param {import('express').Response} res
 * @param {number} status_code 200 o 201.
 * @param {object} data Objeto con el recurso como clave: { entity } o { entities }.
 * @param {object} [meta] Datos de la colección (count, page, ...).
 */
function sendSuccess(res, status_code, data, meta) {
  const { serializeData } = require('../contracts/resources');
  const body = { status: 'success', data: serializeData(data) };
  if (meta) body.meta = meta;
  body.error = null;
  return res.status(status_code).json(body);
}

/**
 * Responde una colección. Una colección vacía es 200 con [] (nunca 404).
 * @param {import('express').Response} res
 * @param {string} key Nombre plural del recurso, p. ej. "entities".
 * @param {Array} items
 */
function sendCollection(res, key, items) {
  const list = items || [];
  return sendSuccess(res, 200, { [key]: list }, { count: list.length });
}

/** Responde 204 sin cuerpo (borrados y acciones sin recurso resultante). */
function sendNoContent(res) {
  return res.status(204).send();
}

/**
 * Responde un error.
 * @param {import('express').Response} res
 * @param {number} status_code
 * @param {{ code: string, message: string, details?: Array }} error
 */
function sendError(res, status_code, { code, message, details = [] }) {
  return res.status(status_code).json({
    status: 'error',
    data: null,
    error: { code, message, details },
  });
}

module.exports = { sendSuccess, sendCollection, sendNoContent, sendError };
