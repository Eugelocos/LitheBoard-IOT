// backend/services/rulechain_service.js

const db = require('../../config/db');
const AppError = require('../../utils/app_error');
const { generateRulesEngineJson } = require('../rulechain_service'); 
// Nota: suponemos que `generateRulesEngineJson` está en un archivo dedicado o modificado.

 /**
  * Recupera todos los rulechains asociados a un client_id.
  * @param {string|number} clientId
  * @returns {Array<object>}
  */
exports.fetchByClientId = async (clientId) => {
  // Verificar existencia de client_id en tabla clients
  const [clientCheck] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [clientId]);
  if (!clientCheck.length) {
    throw new AppError('Client no encontrado', 404);
  }

  const query = 'SELECT * FROM rulechain WHERE user_id = ?';
  const [rows] = await db.query(query, [clientId]);
  return rows.map((row) => ({
    ...row,
    rulechain: row.rulechain,
    entities_ids: row.entities_ids,
    compiled: row.compiled,
  }));
};

/**
 * Recupera un rulechain por su ID.
 * @param {string|number} rulechainId
 * @returns {object|null}
 */
exports.fetchById = async (rulechainId) => {
  const query = 'SELECT * FROM rulechain WHERE rulechain_id = ?';
  const [rows] = await db.query(query, [rulechainId]);
  if (!rows.length) return null;

  const row = rows[0];
  return {
    rulechain_id: row.rulechain_id,
    user_id: row.user_id,
    name: row.name,
    description: row.description,
    rulechain: JSON.parse(row.rulechain),
    entities_ids: JSON.parse(row.entities_ids),
    compiled: row.compiled ? JSON.parse(row.compiled) : null,
  };
};

/**
 * Inserta un nuevo rulechain.
 * Genera el campo `compiled` usando `generateRulesEngineJson`.
 * @param {object} data - { user_id, name, description, rcJson, entities_ids }
 * @returns {object} El nuevo rulechain.
 */
exports.createRulechain = async ({ user_id, name, description, rcJson, entities_ids }) => {
  // 1) Verificar existencia de user_id en clients
  const [clientCheck] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [user_id]);
  if (!clientCheck.length) {
    throw new AppError('Client no encontrado', 404);
  }

  // 2) Generar estructura compilada de rulechain
  let compiled;
  try {
    compiled = await generateRulesEngineJson(rcJson.nodes, rcJson.edges);
  } catch (e) {
    throw new AppError('Error generando JSON compilado del rulechain', 500);
  }

  // 3) Insertar en tabla rulechain
  const insertQuery = `
    INSERT INTO rulechain 
      (user_id, name, description, rulechain, entities_ids, compiled)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    user_id,
    name.trim(),
    description || null,
    JSON.stringify(rcJson),
    JSON.stringify(entities_ids),
    JSON.stringify(compiled),
  ];
  const [result] = await db.query(insertQuery, values);
  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo insertar el rulechain', 500);
  }

  return {
    rulechain_id: result.insertId,
    user_id,
    name,
    description,
    rulechain: rcJson,
    entities_ids,
    compiled,
  };
};

/**
 * Actualiza un rulechain existente (incluye recompilar).
 * @param {object} data - { rulechain_id, name, description, rcJson, entities_ids }
 */
exports.updateRulechain = async ({ rulechain_id, name, description, rcJson, entities_ids }) => {
  // 1) Verificar existencia de rulechain_id
  const [check] = await db.query('SELECT rulechain_id FROM rulechain WHERE rulechain_id = ?', [rulechain_id]);
  if (!check.length) {
    throw new AppError('Rulechain no encontrado', 404);
  }

  // 2) Generar JSON compilado actualizado
  let compiled;
  try {
    compiled = await generateRulesEngineJson(rcJson.nodes, rcJson.edges);
  } catch (e) {
    throw new AppError('Error generando JSON compilado del rulechain', 500);
  }

  // 3) Ejecutar UPDATE
  const updateQuery = `
    UPDATE rulechain
    SET name = ?, description = ?, rulechain = ?, entities_ids = ?, compiled = ?
    WHERE rulechain_id = ?
  `;
  const values = [
    name.trim(),
    description || null,
    JSON.stringify(rcJson),
    JSON.stringify(entities_ids),
    JSON.stringify(compiled),
    rulechain_id,
  ];
  const [result] = await db.query(updateQuery, values);
  if (result.affectedRows === 0) {
    throw new AppError('No se pudo actualizar el rulechain', 500);
  }
};

/**
 * Elimina un rulechain por su ID.
 * @param {string|number} rulechainId
 * @returns {boolean} true si se eliminó, false si no existía.
 */
exports.deleteRulechain = async (rulechainId) => {
  // 1) Verificar existencia
  const [check] = await db.query('SELECT rulechain_id FROM rulechain WHERE rulechain_id = ?', [rulechainId]);
  if (!check.length) {
    return false;
  }

  // 2) Ejecutar DELETE
  await db.query('DELETE FROM rulechain WHERE rulechain_id = ?', [rulechainId]);
  return true;
};
