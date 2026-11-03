// backend/services/alarm_service.js

const db = require('../config/db');
const AppError = require('../utils/app_error');

/**
 * Obtiene todas las alarmas de un client_id determinado,
 * haciendo el JOIN con entities para data adicional.
 */
exports.fetchAlarmsByClientId = async (clientId) => {
  const query = `
    SELECT
      a.alarm_id,
      a.entity_id,
      a.threshold,
      a.client_id,
      a.data_key,
      a.operator,
      e.name,
      e.datasource_type,
      e.datasource_config
    FROM alarms a
    LEFT JOIN entities e ON a.entity_id = e.entity_id
    WHERE a.client_id = ?;
  `;
  const [rows] = await db.query(query, [clientId]);
  return rows; // Puede ser array vacío
};

/**
 * Inserta una nueva alarma en la tabla `alarms`.
 * Retorna el objeto completo de la nueva alarma.
 */
exports.createAlarm = async ({ entity_id, threshold, client_id, data_key, operator }) => {
  const insertQuery = `
    INSERT INTO alarms (entity_id, threshold, client_id, data_key, operator)
    VALUES (?, ?, ?, ?, ?);
  `;
  const [result] = await db.query(insertQuery, [entity_id, threshold, client_id, data_key, operator]);

  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo insertar la alarma', 500);
  }

  // Opcional: devolver el objeto completo consultándolo otra vez,
  // o construir manualmente con insertId:
  return {
    alarm_id: result.insertId,
    entity_id,
    threshold,
    client_id,
    data_key,
    operator
  };
};

exports.fetchById = async (alarmId) => {
  const [rows] = await db.query('SELECT * FROM alarms WHERE alarm_id = ?', [alarmId]);
  return rows[0] || null;
};
exports.updateAlarm = async (alarmId, { entity_id, threshold, data_key, operator }) => {
  await db.query('UPDATE alarms SET entity_id = ?, threshold = ?, data_key = ?, operator = ? WHERE alarm_id = ?',
    [entity_id, threshold, data_key, operator, alarmId]);
  return exports.fetchById(alarmId);
};
exports.deleteAlarm = async (alarmId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM notifications WHERE alarm_id = ?', [alarmId]);
    await connection.query('DELETE FROM alarms WHERE alarm_id = ?', [alarmId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
