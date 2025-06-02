// backend/services/otp_service.js

const db = require('../config/db');
const crypto = require('crypto');
const AppError = require('../utils/appError');

/**
 * Genera un OTP, lo almacena en la tabla `otps` (o `otp_table`) y retorna { client_id, otp }.
 * @param {string} email
 * @returns {object} { client_id, otp }
 */
exports.generateAndStoreOtp = async (email) => {
  // 1) Verificar que exista el cliente con ese email
  const [clientRows] = await db.query('SELECT client_id FROM clients WHERE email = ?', [email]);
  if (!clientRows.length) {
    throw new AppError('Email not found', 404);
  }
  const client_id = clientRows[0].client_id;

  // 2) Generar un OTP de 6 dígitos
  const otp = crypto.randomInt(100000, 999999).toString(); // Cadena de 6 dígitos

  // 3) Almacenar en base de datos (tabla `otps`) con fecha de expiración (por ejemplo, expira en 5 minutos)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos en milisegundos

  // Asumimos que existe una tabla `otps` con columnas: client_id, otp, expires_at
  const insertQuery = `
    INSERT INTO otps (client_id, otp, expires_at)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)
  `;
  const [result] = await db.query(insertQuery, [client_id, otp, expiresAt]);
  if (result.affectedRows < 1) {
    throw new AppError('Error generating OTP', 500);
  }

  return { client_id, otp };
};

/**
 * Verifica que el OTP exista y no haya expirado para ese client_id.
 * @param {string|number} clientId
 * @param {string} otp
 * @returns {boolean}
 */
exports.verifyOtp = async (clientId, otp) => {
  const query = `
    SELECT otp, expires_at
    FROM otps
    WHERE client_id = ? AND otp = ?
  `;
  const [rows] = await db.query(query, [clientId, otp]);
  if (!rows.length) {
    return false;
  }
  const { expires_at } = rows[0];
  if (new Date() > new Date(expires_at)) {
    throw new AppError('OTP expired', 400);
  }

  // Opcional: eliminar o marcar el OTP como usado
  await db.query('DELETE FROM otps WHERE client_id = ?', [clientId]);

  return true;
};
