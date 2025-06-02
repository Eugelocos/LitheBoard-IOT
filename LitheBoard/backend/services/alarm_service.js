// backend/services/alarm_service.js

const db = require('../config/db');
const AppError = require('../utils/appError');

/**
 * Obtiene todas las alarmas de un client_id determinado,
 * haciendo el JOIN con entities para data adicional.
 */
exports.fetchAlarmsByClientId = async (clientId) => {
  const query = `
    SELECT 
      a.alarm_id, 
      a.entity_id, 
      a.valor, 
      a.client_id, 
      a.selected_key,
      a.alarm_condition,
      e.disp_name,
      e.datasource_type,
      e.datasource_config
    FROM alarms a
    JOIN entities e ON a.entity_id = e.entity_id
    WHERE a.client_id = ?;
  `;
  const [rows] = await db.query(query, [clientId]);
  return rows; // Puede ser array vacío
};

/**
 * Inserta una nueva alarma en la tabla `alarms`.
 * Retorna el objeto completo de la nueva alarma.
 */
exports.createAlarm = async ({ entity_id, valor, client_id, selected_key, alarm_condition }) => {
  const insertQuery = `
    INSERT INTO alarms (entity_id, valor, client_id, selected_key, alarm_condition)
    VALUES (?, ?, ?, ?, ?);
  `;
  const [result] = await db.query(insertQuery, [entity_id, valor, client_id, selected_key, alarm_condition]);
  
  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo insertar la alarma', 500);
  }

  // Opcional: devolver el objeto completo consultándolo otra vez,
  // o construir manualmente con insertId:
  return {
    alarm_id: result.insertId,
    entity_id,
    valor,
    client_id,
    selected_key,
    alarm_condition
  };
};
