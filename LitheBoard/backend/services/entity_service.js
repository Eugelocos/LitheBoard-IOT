// backend/services/entity_service.js

const db = require('../config/db');
const AppError = require('../utils/app_error');
const { generateToken } = require('./otp_service');
const { getDatasourceController } = require('../controllers/datasource_initializer');
const eventBus = require('./event_bus');

/**
 * Recupera todas las entidades de un client_id dado.
 * @param {string|number} clientId
 * @returns {Array<object>}
 */
exports.fetchEntitiesByClientId = async (clientId) => {
  const query = 'SELECT * FROM entities WHERE client_id = ?';
  const [rows] = await db.query(query, [clientId]);
  return rows;
};

/**
 * Inserta una nueva entidad en la tabla `entities`, genera token si es MQTT,
 * y registra la entidad en el datasource correspondiente.
 * @param {object} data - { client_id, disp_name, datasource_type, datasource_config, rulechain_id }
 * @returns {object} La entidad recién creada (incluyendo entity_id y token).
 */
exports.createEntity = async ({ client_id, disp_name, datasource_type, datasource_config, rulechain_id }) => {
  // 1) Validar que client_id exista
  const [clientCheck] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [client_id]);
  if (clientCheck.length === 0) {
    throw new AppError('Client no encontrado al crear entidad', 404);
  }

  // 2) Generar token (para MQTT) o sin token (para API)
  let token = null;
  if (datasource_type === 'MQTT') {
    token = await generateToken();
  }

  // 3) Construir JSON de datasource_config en función del tipo
  let configToStore;
  if (datasource_type === 'MQTT') {
    const { sub_topic, pub_topic } = datasource_config;
    if (!sub_topic || !pub_topic) {
      throw new AppError('Sub_topic y pub_topic son requeridos para MQTT', 400);
    }
    configToStore = JSON.stringify({ sub_topic, pub_topic, token });
  } else if (datasource_type === 'API') {
    // Verificar campos mínimos para API
    const { base_url, endpoint, method, polling_interval, query_params, headers, request_body, data_key } =
      datasource_config;
    if (!base_url || !endpoint || !method) {
      throw new AppError('base_url, endpoint y method son requeridos para API', 400);
    }
    configToStore = JSON.stringify({
      base_url,
      endpoint,
      method,
      polling_interval,
      query_params,
      headers,
      request_body,
      data_key,
      token, // Para uniformidad, aunque tal vez no uses token aquí
    });
  } else {
    throw new AppError('Datasource_type no soportado', 400);
  }

  // 4) Insertar en tabla entities
  const insertQuery = `
    INSERT INTO entities
      (client_id, disp_name, datasource_type, datasource_config, rulechain_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(insertQuery, [
    client_id,
    disp_name.trim(),
    datasource_type,
    configToStore,
    rulechain_id || 0,
  ]);
  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo crear la entidad', 500);
  }

  const newEntity = {
    entity_id: result.insertId,
    client_id,
    disp_name: disp_name.trim(),
    datasource_type,
    datasource_config: JSON.parse(configToStore),
    rulechain_id: rulechain_id || 0,
  };

  // 5) Registrar en el controlador de datasource correspondiente
  const datasourceController = await getDatasourceController();
  await datasourceController.addOrUpdateEntity(newEntity);

  // 6) (Opcional) Emitir evento por EventBus
  eventBus.emit('entity.created', newEntity);

  return newEntity;
};

/**
 * Recupera una entidad por su ID.
 * @param {string|number} entityId
 * @returns {object|null} La entidad o null si no existe.
 */
exports.fetchEntityById = async (entityId) => {
  const query = 'SELECT * FROM entities WHERE entity_id = ?';
  const [rows] = await db.query(query, [entityId]);
  if (!rows.length) return null;
  // Parsear datasource_config a objeto
  let cfg = rows[0].datasource_config;
  try {
    cfg = typeof cfg === 'string' ? JSON.parse(cfg) : cfg;
  } catch {
    // Si por alguna razón no es JSON, mantenerlo como vino de la BD
  }
  return { ...rows[0], datasource_config: cfg };
};

/**
 * Actualiza una entidad existente:
 *  - modifica disp_name, datasource_config y rulechain_id.
 *  - notifica al datasourceController sobre el cambio.
 * @param {object} data - { entity_id, disp_name, datasource_config, rulechain_id }
 * @returns {object} La entidad actualizada.
 */
exports.updateEntity = async ({ entity_id, disp_name, datasource_config, rulechain_id }) => {
  // 1) Verificar que exista
  const [check] = await db.query('SELECT entity_id, datasource_config FROM entities WHERE entity_id = ?', [
    entity_id,
  ]);
  if (!check.length) {
    throw new AppError('Entity no encontrada', 404);
  }

  // 2) Construir JSON de datasource_config actualizado
  let newConfig;
  try {
    newConfig = JSON.stringify(datasource_config);
  } catch {
    throw new AppError('datasource_config debe ser un objeto JSON válido', 400);
  }

  // 3) Ejecutar UPDATE
  const updateQuery = `
    UPDATE entities
    SET disp_name = ?, datasource_config = ?, rulechain_id = ?
    WHERE entity_id = ?
  `;
  const [result] = await db.query(updateQuery, [disp_name.trim(), newConfig, rulechain_id || 0, entity_id]);
  if (result.affectedRows === 0) {
    throw new AppError('No se pudo actualizar la entidad', 500);
  }

  // 4) Obtener la entidad actualizada
  const updated = await this.fetchEntityById(entity_id);

  // 5) Notificar al datasourceController
  const datasourceController = await getDatasourceController();
  await datasourceController.addOrUpdateEntity(updated);
  // Alternativa con EventBus:
  eventBus.emit('entity.updated', updated);

  return updated;
};

/**
 * Elimina una entidad y sus datos relacionados:
 *  - elimina historial,
 *  - desvincula widgets y alarmas,
 *  - finalmente borra la entidad.
 * @param {string|number} entityId
 * @returns {string} 'not_found' o 'ok'
 */
exports.deleteEntity = async (entityId) => {
  // 1) Verificar existencia
  const [check] = await db.query('SELECT entity_id FROM entities WHERE entity_id = ?', [entityId]);
  if (!check.length) return 'not_found';

  // 2) Eliminar historial
  await db.query('DELETE FROM historial WHERE entity_id = ?', [entityId]);

  // 3) Desvincular widgets y alarmas
  await db.query('UPDATE widgets SET entity_id = NULL WHERE entity_id = ?', [entityId]);
  await db.query('UPDATE alarms SET entity_id = NULL WHERE entity_id = ?', [entityId]);

  // 4) Eliminar entidad
  await db.query('DELETE FROM entities WHERE entity_id = ?', [entityId]);

  // 5) Notificar a datasourceController (opcional)
  const updatedDatasourceController = await getDatasourceController();
  await updatedDatasourceController.removeEntity(entityId);
  eventBus.emit('entity.deleted', { entity_id: entityId });

  return 'ok';
};

/**
 * Actualiza únicamente el campo `rulechain` dentro de datasource_config JSON.
 * @param {string|number} entityId
 * @param {object} rulechainObj
 */
exports.updateEntityRulechain = async (entityId, rulechainObj) => {
  // 1) Verificar existencia
  const [check] = await db.query('SELECT datasource_config FROM entities WHERE entity_id = ?', [entityId]);
  if (!check.length) {
    throw new AppError('Entity no encontrada', 404);
  }

  // 2) Convertir rulechainObj a JSON string
  let jsonRulechain;
  try {
    jsonRulechain = JSON.stringify(rulechainObj);
  } catch {
    throw new AppError('rulechain debe ser un objeto JSON válido', 400);
  }

  // 3) UPDATE usando JSON_SET
  const updateQuery = `
    UPDATE entities
    SET datasource_config = JSON_SET(datasource_config, '$.rulechain', ?)
    WHERE entity_id = ?
  `;
  const [result] = await db.query(updateQuery, [jsonRulechain, entityId]);
  if (result.affectedRows === 0) {
    throw new AppError('No se pudo actualizar el rulechain', 500);
  }

  // 4) (Opcional) Obtener entidad actualizada y notificar
  const updated = await this.fetchEntityById(entityId);
  const datasourceController = await getDatasourceController();
  await datasourceController.addOrUpdateEntity(updated);
  eventBus.emit('entity.rulechainUpdated', updated);

  return updated;
};
