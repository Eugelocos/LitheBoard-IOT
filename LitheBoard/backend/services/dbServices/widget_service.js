// backend/services/widget_service.js

const db = require('../config/db');
const AppError = require('../utils/appError');

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

  const query = `
    SELECT 
      e.entity_id, 
      e.client_id   AS entity_client_id, 
      e.disp_name, 
      e.datasource_type, 
      e.datasource_config, 
      w.widget_id,
      w.dashboard_id, 
      w.widget_type, 
      w.config_data, 
      w.widget_name
    FROM widgets w
    LEFT JOIN entities e ON e.entity_id = w.entity_id
    WHERE w.client_id = ? AND w.dashboard_id = ?;
  `;
  const [rows] = await db.query(query, [clientId, dashboardId]);

  return rows.map((row) => {
    // Parsear los JSON que vienen en row.datasource_config y row.config_data
    let datasourceConfig = {};
    try {
      datasourceConfig = row.datasource_config ? JSON.parse(row.datasource_config) : {};
    } catch {
      datasourceConfig = {};
    }
    let config = {};
    try {
      config = row.config_data ? JSON.parse(row.config_data) : {};
    } catch {
      config = {};
    }

    // Armar configuración unificada según datasource_type
    let parsedDatasourceConfig = {};
    if (row.datasource_type === 'MQTT') {
      parsedDatasourceConfig = { ...datasourceConfig };
    } else if (row.datasource_type === 'API') {
      parsedDatasourceConfig = {
        base_url: datasourceConfig.base_url || '',
        endpoint: datasourceConfig.endpoint || '',
        method: datasourceConfig.method || 'GET',
        polling_interval: datasourceConfig.polling_interval || 0,
        query_params: datasourceConfig.query_params || {},
        headers: datasourceConfig.headers || {},
        request_body: datasourceConfig.request_body || {},
        data_key: datasourceConfig.data_key || '',
      };
    }

    // Agregar datasource_type y parsedDatasourceConfig dentro de config
    config.datasource_type = row.datasource_type;
    config.datasource_config = parsedDatasourceConfig;

    return {
      entity_id: row.entity_id,
      entity_client_id: row.entity_client_id,
      disp_name: row.disp_name,
      datasource_type: row.datasource_type,
      // No incluimos datasource_config crudo para no exponer data interna
      widget_id: row.widget_id,
      dashboard_id: row.dashboard_id,
      widget_type: row.widget_type,
      widget_name: row.widget_name,
      // Convertir config a JSON para enviar al cliente
      config_data: JSON.stringify(config),
    };
  });
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
  let config = {};
  try {
    config = row.config_data ? JSON.parse(row.config_data) : {};
  } catch {
    config = {};
  }

  return {
    widget_id: row.widget_id,
    widget_name: row.widget_name,
    entity_id: row.entity_id,
    dashboard_id: row.dashboard_id,
    widget_type: row.widget_type,
    config_data: config,
    client_id: row.client_id,
  };
};

/**
 * Recupera todos los widgets.
 * @returns {Array<object>}
 */
exports.fetchAll = async () => {
  const query = 'SELECT * FROM widgets';
  const [rows] = await db.query(query);
  return rows.map((row) => {
    let config = {};
    try {
      config = row.config_data ? JSON.parse(row.config_data) : {};
    } catch {
      config = {};
    }
    return {
      widget_id: row.widget_id,
      widget_name: row.widget_name,
      entity_id: row.entity_id,
      dashboard_id: row.dashboard_id,
      widget_type: row.widget_type,
      config_data: config,
      client_id: row.client_id,
    };
  });
};

/**
 * Crea un nuevo widget.
 * @param {object} data - { widget_name, entity_id, dashboard_id, widget_type, config_data, client_id }
 * @returns {object} El widget recién creado.
 */
exports.createWidget = async ({ widget_name, entity_id, dashboard_id, widget_type, config_data, client_id }) => {
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
    INSERT INTO widgets (widget_name, entity_id, dashboard_id, widget_type, config_data, client_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  let configJson;
  try {
    configJson = JSON.stringify(config_data);
  } catch {
    throw new AppError('config_data debe ser un objeto JSON válido', 400);
  }

  const [result] = await db.query(insertQuery, [
    widget_name.trim(),
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
    widget_name: widget_name.trim(),
    entity_id,
    dashboard_id,
    widget_type,
    config_data,
    client_id,
  };
};

/**
 * Actualiza un widget existente.
 * @param {string|number} widgetId
 * @param {object} data - { widget_name, entity_id, dashboard_id, widget_type, config_data }
 */
exports.updateWidget = async (widgetId, { widget_name, entity_id, dashboard_id, widget_type, config_data }) => {
  // 1) Verificar existencia
  const [check] = await db.query('SELECT widget_id FROM widgets WHERE widget_id = ?', [widgetId]);
  if (!check.length) {
    throw new AppError('Widget no encontrado', 404);
  }

  // 2) Validar config_data
  let configJson;
  try {
    configJson = JSON.stringify(config_data || {});
  } catch {
    throw new AppError('config_data debe ser un objeto JSON válido', 400);
  }

  // 3) Ejecutar UPDATE
  const updateQuery = `
    UPDATE widgets
    SET widget_name = ?, 
        entity_id = ?, 
        dashboard_id = ?, 
        widget_type = ?, 
        config_data = ?
    WHERE widget_id = ?
  `;
  const values = [
    widget_name.trim(),
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
