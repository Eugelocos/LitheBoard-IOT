// backend/services/dashboard_service.js

const db = require('../config/db');
const AppError = require('../utils/app_error');

/**
 * Crea un nuevo dashboard.
 * @param {object} data - { name, description, client_id, shared_client_ids }
 * @returns {object} El dashboard insertado (incluyendo dashboard_id).
 */
exports.createDashboard = async ({ name, description, client_id, shared_client_ids }) => {
  // 1) Verificar que client_id exista en tabla clients (opcional)
  const [clientCheck] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [client_id]);
  if (clientCheck.length === 0) {
    throw new AppError('Client no encontrado al crear dashboard', 404);
  }

  // 2) Insertar en dashboards
  const insertQuery = `
    INSERT INTO dashboards (name, description, client_id, shared_client_ids)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await db.query(insertQuery, [
    name,
    description,
    client_id,
    JSON.stringify(shared_client_ids),
  ]);

  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo crear el dashboard', 500);
  }

  // 3) Construir y devolver el objeto del dashboard
  return {
    dashboard_id: result.insertId,
    name,
    description,
    client_id,
    shared_client_ids,
  };
};

/**
 * NUEVO (fix S-02): recupera un único dashboard por su ID, para poder
 * verificar ownership (dashboard.client_id) antes de update/delete/assign.
 * @param {string|number} dashboardId
 * @returns {object|null}
 */
exports.fetchById = async (dashboardId) => {
  const [rows] = await db.query('SELECT * FROM dashboards WHERE dashboard_id = ?', [dashboardId]);
  if (!rows.length) return null;

  const row = rows[0];
  let additionalClientIds = [];
  try {
    additionalClientIds =
      typeof row.shared_client_ids === 'string'
        ? JSON.parse(row.shared_client_ids)
        : row.shared_client_ids || [];
  } catch {
    additionalClientIds = [];
  }

  return { ...row, shared_client_ids: additionalClientIds };
};

/**
 * Obtiene todos los dashboards donde client_id es dueño o está en shared_client_ids.
 * @param {string|number} clientId
 * @returns {Array<object>} Array de dashboards.
 */
exports.fetchDashboardsByClientId = async (clientId) => {
  const query = `
    SELECT * FROM dashboards
    WHERE client_id = ?
    OR JSON_CONTAINS(shared_client_ids, CAST(? AS JSON), '$')
  `;
  const [rows] = await db.query(query, [clientId, clientId]);
  return rows;
};

/**
 * Actualiza un dashboard existente.
 * @param {object} data - { dashboard_id, name, description, shared_client_ids }
 * @returns {boolean} true si se actualizó, false si no existe.
 */
exports.updateDashboard = async ({ dashboard_id, name, description, shared_client_ids }) => {
  // Verificar existencia
  const [check] = await db.query('SELECT dashboard_id FROM dashboards WHERE dashboard_id = ?', [dashboard_id]);
  if (check.length === 0) return false;

  const updateQuery = `
    UPDATE dashboards
    SET name = ?, description = ?, shared_client_ids = ?
    WHERE dashboard_id = ?
  `;
  const [result] = await db.query(updateQuery, [
    name,
    description,
    JSON.stringify(shared_client_ids),
    dashboard_id,
  ]);

  return result.affectedRows === 1;
};

/**
 * Elimina un dashboard y sus widgets asociados.
 * @param {string|number} dashboardId
 * @returns {string|boolean} 'not_found' | true
 */
exports.deleteDashboard = async (dashboardId) => {
  // 1) Verificar existencia
  const [check] = await db.query('SELECT dashboard_id FROM dashboards WHERE dashboard_id = ?', [dashboardId]);
  if (check.length === 0) return 'not_found';

  // 2) Eliminar widgets asociados
  await db.query('DELETE FROM widgets WHERE dashboard_id = ?', [dashboardId]);

  // 3) Eliminar dashboard
  await db.query('DELETE FROM dashboards WHERE dashboard_id = ?', [dashboardId]);

  return true;
};

/**
 * Asigna un clientId a shared_client_ids de un dashboard.
 * @param {string|number} clientId
 * @param {string|number} dashboardId
 * @returns {object|'not_found'|'already_assigned'} El dashboard actualizado u otro indicador.
 */
exports.assignDashboardToClient = async (clientId, dashboardId) => {
  // 1) Obtener shared_client_ids del dashboard
  const [rows] = await db.query(
    'SELECT shared_client_ids FROM dashboards WHERE dashboard_id = ?',
    [dashboardId]
  );
  if (rows.length === 0) return 'not_found';

  // FIX (bug preexistente, mismo family que el de widget_service): la columna
  // es de tipo JSON en MySQL, mysql2 ya la entrega como array/objeto, no como
  // string. JSON.parse a ciegas sobre eso tira SyntaxError y esta función
  // devolvía 500 siempre que shared_client_ids no viniera como string.
  let associatedClients = [];
  try {
    const raw = rows[0].shared_client_ids;
    associatedClients = (typeof raw === 'string' ? JSON.parse(raw) : raw) || [];
  } catch {
    throw new AppError('Error al parsear shared_client_ids', 500);
  }

  // 2) Verificar si ya está asignado
  if (associatedClients.includes(clientId)) {
    return 'already_assigned';
  }

  // 3) Agregar y actualizar en BD
  associatedClients.push(clientId);
  const updateQuery = `
    UPDATE dashboards
    SET shared_client_ids = ?
    WHERE dashboard_id = ?
  `;
  const [result] = await db.query(updateQuery, [JSON.stringify(associatedClients), dashboardId]);
  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo asignar el dashboard al cliente', 500);
  }

  // 4) Devolver el dashboard actualizado
  return {
    dashboard_id: Number(dashboardId),
    shared_client_ids: associatedClients,
  };
};