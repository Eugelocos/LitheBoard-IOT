// backend/services/dbServices/widget_service.js

const db = require('../../config/db');
const AppError = require('../../utils/app_error');

/**
 * Recupera widgets con entidades asociadas para client_id y dashboard_id.
 * Realiza LEFT JOIN entre widgets y entities, parsea JSON y arma configuración.
 */
exports.fetchWidgetsWithEntities = async (clientId, dashboardId) => {
  // Verificar existencia de client y dashboard (opcional, según requerimientos)
  const [clientCheck] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [clientId]);
  if (!clientCheck.length) throw new AppError('Client no encontrado', 404);

  const [dashboardCheck] = await db.query('SELECT dashboard_id FROM dashboards WHERE dashboard_id = ?', [
    dashboardId,
  ]);
  if (!dashboardCheck.length) throw new AppError('Dashboard no encontrado', 404);

  const [rows] = await db.query('SELECT * FROM widgets WHERE client_id = ? AND dashboard_id = ?', [clientId, dashboardId]);
  return rows;
};

/**
 * Recupera un widget por su ID.
 * @param {string|number} widgetId
 * @returns {object|null}
 */
exports.fetchById = async (widgetId) => {
  const query = 'SELECT * FROM widgets WHERE widget_id = ?';
  const [rows] = await db.query(query, [widgetId]);
  if (!rows.length) return null;

  const row = rows[0];
  // FIX: mismo issue que en fetchWidgetsWithEntities — widget_config es
  // columna JSON, mysql2 ya la entrega como objeto.
  let config = {};
  try {
    config = typeof row.widget_config === 'string'
      ? JSON.parse(row.widget_config)
      : row.widget_config || {};
  } catch {
    config = {};
  }

  return {
    widget_id: row.widget_id,
    name: row.name,
    entity_id: row.entity_id,
    dashboard_id: row.dashboard_id,
    widget_type: row.widget_type,
    widget_config: config,
    client_id: row.client_id,
  };
};

/**
 * NUEVO (fix del leak en GET /api/widget): recupera únicamente los widgets
 * que pertenecen a un client_id dado, en lugar de la tabla completa.
 * @param {string|number} clientId
 * @returns {Array<object>}
 */
exports.fetchAllByClientId = async (clientId) => {
  const query = 'SELECT * FROM widgets WHERE client_id = ?';
  const [rows] = await db.query(query, [clientId]);
  return rows.map((row) => {
    // FIX: mismo issue de widget_config como columna JSON
    let config = {};
    try {
      config = typeof row.widget_config === 'string'
        ? JSON.parse(row.widget_config)
        : row.widget_config || {};
    } catch {
      config = {};
    }
    return {
      widget_id: row.widget_id,
      name: row.name,
      entity_id: row.entity_id,
      dashboard_id: row.dashboard_id,
      widget_type: row.widget_type,
      widget_config: config,
      client_id: row.client_id,
    };
  });
};

/**
 * @deprecated Ya no se usa desde el controller (fugaba todos los widgets de
 * todos los clientes). Se deja sólo por si algún script interno la usa;
 * evaluar borrarla en la Fase 2 (limpieza de deuda técnica).
 * @returns {Array<object>}
 */
exports.fetchAll = async () => {
  const query = 'SELECT * FROM widgets';
  const [rows] = await db.query(query);
  return rows.map((row) => {
    // FIX: mismo issue de widget_config como columna JSON
    let config = {};
    try {
      config = typeof row.widget_config === 'string'
        ? JSON.parse(row.widget_config)
        : row.widget_config || {};
    } catch {
      config = {};
    }
    return {
      widget_id: row.widget_id,
      name: row.name,
      entity_id: row.entity_id,
      dashboard_id: row.dashboard_id,
      widget_type: row.widget_type,
      widget_config: config,
      client_id: row.client_id,
    };
  });
};

/**
 * Crea un nuevo widget.
 * @param {object} data - { name, entity_id, dashboard_id, widget_type, widget_config, client_id }
 * @returns {object} El widget recién creado.
 */
exports.createWidget = async ({ name, entity_id, dashboard_id, widget_type, widget_config, client_id }) => {
  // 1) Verificar existencia de client, entity y dashboard
  const [clientCheck] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [client_id]);
  if (!clientCheck.length) throw new AppError('Client no encontrado', 404);

  const [entityCheck] = await db.query('SELECT entity_id FROM entities WHERE entity_id = ?', [entity_id]);
  if (!entityCheck.length) throw new AppError('Entity no encontrado', 404);

  const [dashboardCheck] = await db.query('SELECT dashboard_id FROM dashboards WHERE dashboard_id = ?', [
    dashboard_id,
  ]);
  if (!dashboardCheck.length) throw new AppError('Dashboard no encontrado', 404);

  // 2) Insertar en tabla widgets
  const insertQuery = `
    INSERT INTO widgets (name, entity_id, dashboard_id, widget_type, widget_config, client_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  let configJson;
  try {
    configJson = JSON.stringify(widget_config);
  } catch {
    throw new AppError('widget_config debe ser un objeto JSON válido', 400);
  }

  const [result] = await db.query(insertQuery, [
    name.trim(),
    entity_id,
    dashboard_id,
    widget_type,
    configJson,
    client_id,
  ]);
  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo crear el widget', 500);
  }

  return {
    widget_id: result.insertId,
    name: name.trim(),
    entity_id,
    dashboard_id,
    widget_type,
    widget_config,
    client_id,
  };
};

/**
 * Actualiza un widget existente.
 * @param {string|number} widgetId
 * @param {object} data - { name, entity_id, dashboard_id, widget_type, widget_config }
 */
exports.updateWidget = async (widgetId, { name, entity_id, dashboard_id, widget_type, widget_config }) => {
  // 1) Verificar existencia
  const [check] = await db.query('SELECT widget_id FROM widgets WHERE widget_id = ?', [widgetId]);
  if (!check.length) {
    throw new AppError('Widget no encontrado', 404);
  }

  // 2) Validar widget_config
  let configJson;
  try {
    configJson = JSON.stringify(widget_config || {});
  } catch {
    throw new AppError('widget_config debe ser un objeto JSON válido', 400);
  }

  // 3) Ejecutar UPDATE
  const updateQuery = `
    UPDATE widgets
    SET name = ?,
        entity_id = ?,
        dashboard_id = ?,
        widget_type = ?,
        widget_config = ?
    WHERE widget_id = ?
  `;
  const values = [
    name.trim(),
    entity_id,
    dashboard_id || null,
    widget_type,
    configJson,
    widgetId,
  ];
  const [result] = await db.query(updateQuery, values);
  if (result.affectedRows === 0) {
    throw new AppError('No se pudo actualizar el widget', 500);
  }
};

/**
 * Elimina un widget por su ID.
 * @param {string|number} widgetId
 * @returns {boolean} true si se eliminó, false si no existía.
 */
exports.deleteWidget = async (widgetId) => {
  // 1) Verificar existencia
  const [check] = await db.query('SELECT widget_id FROM widgets WHERE widget_id = ?', [widgetId]);
  if (!check.length) {
    return false;
  }

  // 2) DELETE
  await db.query('DELETE FROM widgets WHERE widget_id = ?', [widgetId]);
  return true;
};
