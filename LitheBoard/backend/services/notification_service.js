// backend/services/notification_service.js

const db = require('../config/db');
const AppError = require('../utils/app_error');

/**
 * NUEVO (fix S-02): recupera una notificación por su ID, para poder
 * verificar ownership (notification.client_id) antes de marcarla como leída.
 * @param {string|number} notificationId
 * @returns {object|null}
 */
exports.fetchById = async (notificationId) => {
  const [rows] = await db.query('SELECT * FROM notifications WHERE notification_id = ?', [notificationId]);
  if (!rows.length) return null;
  return rows[0];
};

/**
 * Recupera notificaciones por client_id.
 * @param {string|number} clientId
 * @returns {Array<object>}
 */
exports.fetchByClientId = async (clientId) => {
  // Verificar existencia de client_id
  const [check] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [clientId]);
  if (!check.length) {
    throw new AppError('Client no encontrado', 404);
  }

  const query = 'SELECT * FROM notifications WHERE client_id = ?';
  const [rows] = await db.query(query, [clientId]);
  return rows;
};

/**
 * Inserta una nueva notificación.
 * @param {object} value - { alarm_id, client_id, created_at, value }
 * @returns {object} La notificación recién creada.
 */
exports.createNotification = async ({ alarm_id, client_id, created_at, value: payload }) => {
  // Validar que existan alarm y client
  const [alarmCheck] = await db.query('SELECT alarm_id FROM alarms WHERE alarm_id = ?', [alarm_id]);
  if (!alarmCheck.length) {
    throw new AppError('Alarm no encontrada', 404);
  }
  const [clientCheck] = await db.query('SELECT client_id FROM clients WHERE client_id = ?', [client_id]);
  if (!clientCheck.length) {
    throw new AppError('Client no encontrado', 404);
  }

  const insertQuery = `
    INSERT INTO notifications (alarm_id, client_id, created_at, value)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await db.query(insertQuery, [alarm_id, client_id, created_at, JSON.stringify(payload)]);
  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo insertar la notificación', 500);
  }

  return {
    notification_id: result.insertId,
    alarm_id,
    client_id,
    created_at,
    value: payload,
    is_read: false,
  };
};

/**
 * Marca una notificación como leída (is_read = 1).
 * @param {string|number} notificationId
 */
exports.markAsRead = async (notificationId) => {
  // Verificar que exista la notificación
  const [check] = await db.query('SELECT notification_id FROM notifications WHERE notification_id = ?', [
    notificationId,
  ]);
  if (!check.length) {
    throw new AppError('Notificación no encontrada', 404);
  }

  const updateQuery = 'UPDATE notifications SET is_read = 1 WHERE notification_id = ?';
  const [result] = await db.query(updateQuery, [notificationId]);
  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo marcar la notificación como leída', 500);
  }
};