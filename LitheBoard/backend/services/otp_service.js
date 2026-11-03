const speakeasy = require('speakeasy')
const crypto = require('crypto');

/**
 * The function `generateOtp` generates a one-time password (OTP) using the speakeasy library, stores
 * it in a database with an expiration time, and returns the OTP.
 * @param {int} client_id - The `client_id` parameter in the `generateOtp` function is is_used to identify the
 * client for whom the OTP (One-Time Password) is being generated. It is typically a unique identifier
 * associated with the client in the database or system.
 * @param {object} db - The `db` parameter in the `generateOtp` function is likely a database connection object
 * or client that allows you to interact with a database. It seems to be using promises for database
 * queries based on the `.promise()` method being called on it. This suggests that the `db` object is
 * @returns {Promise<string>} -The `generateOtp` function returns the generated OTP (One-Time Password) value.
 */
async function generateOtp(client_id, db) {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);


    const query =
      'INSERT INTO otp_tokens (client_id, otp, expires_at, is_used) VALUES (?, ?, ?, ?)';
    const values = [client_id, otp, expiresAt, false];

    await db.query(query, values);


    return otp;
  } catch (err) {
    console.error('Error generating OTP:', err);
    throw new Error('No se pudo generar el OTP. Intente nuevamente.');
  }
}

/**
 * The function `verifyOtpInDatabase` checks if a given OTP is valid and unused in a database for a
 * specific client ID.
 * @param {int} client_id - The `client_id` parameter is typically a unique identifier for a client or user
 * in a system. It is is_used to associate the OTP (One-Time Password) with a specific client in the
 * database.
 * @param {int} otp - The `otp` parameter in the `verifyOtpInDatabase` function represents the One-Time
 * Password (OTP) that is being verified in the database. This OTP is typically generated and sent to
 * the user for authentication purposes. The function checks if this OTP exists in the database for a
 * specific `client
 * @param {object} db - The `db` parameter in the `verifyOtpInDatabase` function is typically an instance of a
 * database connection that allows you to interact with a database. It seems to be using promises for
 * executing queries. This parameter is is_used to query the database to verify the OTP (One-Time
 * Password) provided
 * @returns {Promise<boolean>} The function `verifyOtpInDatabase` returns a boolean value. It returns `true` if the OTP is
 * successfully verified and updated in the database, and it returns `false` in the following cases:
 * 1. If no matching OTP entry is found in the database for the given client_id and OTP.
 * 2. If the OTP has expired based on the `expires_at` timestamp.
 * 3.
 */
async function verifyOtpInDatabase(client_id, otp, db) {
  try {

    const query = 'SELECT otp_token_id, otp, expires_at, is_used FROM otp_tokens WHERE client_id = ? AND otp = ? ORDER BY otp_token_id DESC LIMIT 1';
    const [results] = await db.query(query, [client_id, otp]);

    if (results.length === 0) {
      return false; 
    }

    const otpEntry = results[0];


    if (new Date() > new Date(otpEntry.expires_at)) {
      return false; 
    }


    if (otpEntry.is_used) {
      return false; 
    }


    const updateQuery = 'UPDATE otp_tokens SET is_used = TRUE WHERE otp_token_id = ? AND client_id = ? AND is_used = FALSE AND expires_at > UTC_TIMESTAMP()';
    const [updated] = await db.query(updateQuery, [otpEntry.otp_token_id, client_id]);
    return updated.affectedRows === 1;
  } catch (err) {
    console.error('Error verifying OTP:', err);
    throw new Error('Error al verificar el OTP.');
  }
}


/**
 * The function `generateToken` asynchronously generates a random 16-byte token in hexadecimal format.
 * @returns {Promise<string>} - The `generateToken` function is returning a Promise that resolves to a randomly generated
 * token in hexadecimal format.
 */
async function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = { generateOtp, verifyOtpInDatabase , generateToken };
