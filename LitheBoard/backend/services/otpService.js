const speakeasy = require('speakeasy');
const crypto = require('crypto');

// Función para generar OTP y guardarlo en la tabla `otp`
const generateOtp = (client_id, db, callback) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32'
  });

  // Definir tiempo de expiración (por ejemplo, 5 minutos)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Insertar OTP en la tabla `otp`
  db.query(
    'INSERT INTO otp_tokens (client_id, otp, expires_at, used) VALUES (?, ?, ?, ?)',
    [client_id, otp, expiresAt, false],
    (err) => {
      if (err) return callback(err);
      callback(null, otp);
    }
  );
};

const verifyOtp = (client_id, otp, db, callback) => {
    // Buscar el OTP en la tabla `otp_tokens`
    db.query('SELECT otp, expires_at, used FROM otp_tokens WHERE client_id = ? AND otp = ?', [client_id, otp], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(null, false); // OTP no encontrado
  
      const otpEntry = results[0];
  
      // Verificar si el OTP ha expirado
      if (new Date() > new Date(otpEntry.expires_at)) {
        return callback(null, false); // OTP expirado
      }
  
      // Verificar si el OTP ya ha sido usado
      if (otpEntry.used) {
        return callback(null, false); // OTP ya usado
      }
  
      // Marcar el OTP como usado
      db.query('UPDATE otp_tokens SET used = TRUE WHERE otp = ?', [otp], (err) => {
        if (err) return callback(err);
        callback(null, true);
      });
    });
};

// Función para generar un token único
const generateToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

module.exports = { generateOtp, verifyOtp, generateToken };
