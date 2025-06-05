// backend/services/historic_service.js

const db = require('../config/db');
const AppError = require('../utils/app_error');

/**
 * Recupera todos los historiales asociados a un entity_id.
 * @param {string|number} entityId
 * @returns {Array<object>}
 */
exports.fetchByEntityId = async (entityId) => {
  // 1) Verificar si existe entity_id
  const [check] = await db.query('SELECT entity_id FROM entities WHERE entity_id = ?', [entityId]);
  if (!check.length) {
    throw new AppError('Entity no encontrada', 404);
  }

  const query = 'SELECT * FROM historial WHERE entity_id = ?';
  const [rows] = await db.query(query, [entityId]);
  return rows;
};

/**
 * Recupera todos los historiales asociados a un client_id.
 * @param {string|number} clientId
 * @returns {Array<object>}
 */
exports.fetchByClientId = async (clientId) => {
  // 1) Verificar si existe client_id
  const [check] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [clientId]);
  if (!check.length) {
    throw new AppError('Client no encontrado', 404);
  }

  const query = 'SELECT * FROM historial WHERE client_id = ?';
  const [rows] = await db.query(query, [clientId]);
  return rows;
};

/**
 * Inserta un nuevo registro en la tabla `historial`.
 * @param {object} data - { entity_id, date, data, client_id, selected_key }
 */
exports.createHistoric = async ({ entity_id, date, data: recordData, client_id, selected_key }) => {
  // 1) Validar existencia de entity y client
  const [entityCheck] = await db.query('SELECT entity_id FROM entities WHERE entity_id = ?', [entity_id]);
  if (!entityCheck.length) {
    throw new AppError('Entity no encontrada', 404);
  }

  const [clientCheck] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [client_id]);
  if (!clientCheck.length) {
    throw new AppError('Client no encontrado', 404);
  }

  // 2) Insertar registro
  const insertQuery = `
    INSERT INTO historial (entity_id, date, data, client_id, selected_key)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(insertQuery, [entity_id, date, recordData, client_id, selected_key]);
  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo insertar el historic', 500);
  }

  return;
};
