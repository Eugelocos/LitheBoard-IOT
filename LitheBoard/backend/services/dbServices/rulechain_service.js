// backend/services/rulechain_service.js

const db = require('../../config/db');
const AppError = require('../../utils/app_error');
const { generateRulesEngineJson } = require('../rulechain_service');
const { toRuntimeGraph } = require('../../contracts/rulechain_definition');
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

  const query = 'SELECT * FROM rulechains WHERE client_id = ?';
  const [rows] = await db.query(query, [clientId]);
  return rows.map((row) => ({
    ...row,
    definition: typeof row.definition === 'string' ? JSON.parse(row.definition) : row.definition,
    entity_ids: row.entity_ids,
    compiled: row.compiled,
  }));
};

/**
 * Recupera un rulechain por su ID.
 * @param {string|number} rulechainId
 * @returns {object|null}
 */
exports.fetchById = async (rulechainId) => {
  const query = 'SELECT * FROM rulechains WHERE rulechain_id = ?';
  const [rows] = await db.query(query, [rulechainId]);
  if (!rows.length) return null;

  const row = rows[0];
  return {
    rulechain_id: row.rulechain_id,
    client_id: row.client_id,
    name: row.name,
    description: row.description,
    definition: typeof row.definition === 'string' ? JSON.parse(row.definition) : row.definition,
    entity_ids: typeof row.entity_ids === 'string' ? JSON.parse(row.entity_ids) : row.entity_ids,
    compiled: typeof row.compiled === 'string' ? JSON.parse(row.compiled) : row.compiled ?? null,
  };
};

/**
 * Inserta un nuevo rulechain.
 * Genera el campo `compiled` usando `generateRulesEngineJson`.
 * @param {object} data - { client_id, name, description, rcJson, entity_ids }
 * @returns {object} El nuevo rulechain.
 */
exports.createRulechain = async ({ client_id, name, description, rcJson, entity_ids }) => {
  // 1) Verificar existencia de client_id en clients
  const [clientCheck] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [client_id]);
  if (!clientCheck.length) {
    throw new AppError('Client no encontrado', 404);
  }

  // 2) Generar estructura compilada de rulechain
  let compiled;
  try {
    compiled = await generateRulesEngineJson(toRuntimeGraph(rcJson).nodes, toRuntimeGraph(rcJson).edges);
  } catch (e) {
    throw new AppError('Error generando JSON compilado del rulechain', 500);
  }

  // 3) Insertar en tabla rulechain
  const insertQuery = `
    INSERT INTO rulechains
      (client_id, name, description, definition, entity_ids, compiled)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    client_id,
    name.trim(),
    description || null,
    JSON.stringify(rcJson),
    JSON.stringify(entity_ids),
    JSON.stringify(compiled),
  ];
  const [result] = await db.query(insertQuery, values);
  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo insertar el rulechain', 500);
  }

  return {
    rulechain_id: result.insertId,
    client_id,
    name,
    description,
    definition: rcJson,
    entity_ids,
    compiled,
  };
};

/**
 * Actualiza un rulechain existente (incluye recompilar).
 * @param {object} data - { rulechain_id, name, description, rcJson, entity_ids }
 */
exports.updateRulechain = async ({ rulechain_id, name, description, rcJson, entity_ids }) => {
  // 1) Verificar existencia de rulechain_id
  const [check] = await db.query('SELECT rulechain_id FROM rulechains WHERE rulechain_id = ?', [rulechain_id]);
  if (!check.length) {
    throw new AppError('Rulechain no encontrado', 404);
  }

  // 2) Generar JSON compilado actualizado
  let compiled;
  try {
    compiled = await generateRulesEngineJson(toRuntimeGraph(rcJson).nodes, toRuntimeGraph(rcJson).edges);
  } catch (e) {
    throw new AppError('Error generando JSON compilado del rulechain', 500);
  }

  // 3) Ejecutar UPDATE
  const updateQuery = `
    UPDATE rulechains
    SET name = ?, description = ?, definition = ?, entity_ids = ?, compiled = ?
    WHERE rulechain_id = ?
  `;
  const values = [
    name.trim(),
    description || null,
    JSON.stringify(rcJson),
    JSON.stringify(entity_ids),
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
  const [check] = await db.query('SELECT rulechain_id FROM rulechains WHERE rulechain_id = ?', [rulechainId]);
  if (!check.length) {
    return false;
  }

  const [assigned] = await db.query('SELECT entity_id FROM entities WHERE rulechain_id = ? LIMIT 1', [rulechainId]);
  if (assigned.length) {
    throw new AppError('Assign the default or another rulechain to its entities before deleting this rulechain.', 409, 'RULECHAIN_IN_USE');
  }
  // 2) Ejecutar DELETE
  await db.query('DELETE FROM rulechains WHERE rulechain_id = ?', [rulechainId]);
  return true;
};
