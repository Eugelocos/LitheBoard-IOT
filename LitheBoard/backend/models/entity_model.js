// backend/models/entity_model.js

const db = require('../config/db');

/**
 * getEntities
 * -----------
 * Recupera todas las entidades de la tabla `entities`.
 * @returns {Promise<Object[]>}
 */
async function getEntities() {
  const query = `SELECT * FROM entities`;

  try {
    // Usamos db.query() directamente porque db ya es un pool promise
    const [rows] = await db.query(query);

    return rows.map(entity => ({
      ...entity,
      // Si `datasource_config` viene como JSON en la BD, 
      // asumimos que MySQL2 ya lo parseó a objeto JS automáticamente.
      // Si no, parsearíamos con JSON.parse(entity.datasource_config).
      datasource_config: (() => {
        try {
          return entity.datasource_config;
        } catch (error) {
          console.error(
            `Error parsing datasource_config for entity ${entity.entity_id}:`,
            error.message
          );
          return null;
        }
      })()
    }));
  } catch (error) {
    console.error('Error fetching entities:', error.message);
    throw error;
  }
}

/**
 * getToken
 * --------
 * Busca en la tabla `entities` la configuración (datasource_config) 
 * del cliente y entidad indicados, y devuelve el campo `token`.
 * @param {number} client_id
 * @param {number} entity_id
 * @returns {Promise<String|null>}
 */
async function getToken(client_id, entity_id) {
  try {
    const [rows] = await db.query(
      "SELECT credential FROM entities WHERE client_id = ? AND entity_id = ?",
      [client_id, entity_id]
    );
    const credential = rows[0]?.credential || {};
    // Si `datasource_config` ya es objeto JS, devolvemos directamente:
    return (typeof credential === 'string' ? JSON.parse(credential) : credential).token || null;
  } catch (error) {
    console.error("Error al obtener el token:", error);
    throw error;
  }
}

/**
 * getDatasourceType
 * -----------------
 * Recupera el tipo de datasource de una entidad concreta.
 * @param {number} client_id
 * @param {number} entity_id
 * @returns {Promise<String|null>}
 */
async function getDatasourceType(client_id, entity_id) {
  try {
    const [rows] = await db.query(
      "SELECT datasource_type FROM entities WHERE client_id = ? AND entity_id = ?",
      [client_id, entity_id]
    );
    const datasource_config = rows[0]?.datasource_config || {};
    // Aquí devolvemos `.datasource_type` en lugar de una variable inexistente
    return rows[0]?.datasource_type || null;
  } catch (error) {
    console.error("Error al obtener el tipo de datasource:", error);
    throw error;
  }
}

/**
 * updateEntityStatus
 * ------------------
 * Actualiza el campo `status` dentro del JSON `datasource_config`
 * de una entidad dada, y devuelve su threshold actualizado.
 * @param {number} client_id
 * @param {number} entity_id
 * @param {string|number|boolean} status
 * @returns {Promise<Object|null>} - El JSON actualizado en `datasource_config`, o null si no existe.
 */
async function updateEntityStatus(client_id, entity_id, status) {
  try {
    const [result] = await db.query(
      `UPDATE entities
         SET connection_status = ?
       WHERE client_id = ? AND entity_id = ?`,
      [status, client_id, entity_id]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se encontró el registro para actualizar');
    }

    // Recuperar el JSON actualizado para devolverlo
    const [updatedRows] = await db.query(
      'SELECT connection_status FROM entities WHERE client_id = ? AND entity_id = ?',
      [client_id, entity_id]
    );
    return updatedRows[0]?.connection_status || null;
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    throw error;
  }
}

module.exports = {
  getEntities,
  getToken,
  getDatasourceType,
  updateEntityStatus
};
