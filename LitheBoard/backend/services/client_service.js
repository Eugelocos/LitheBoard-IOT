// backend/services/client_service.js

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/app_error');

/**
 * Busca un cliente por su email.
 * @param {string} email
 * @returns {object|null} El objeto cliente o null si no existe.
 */
exports.findByEmail = async (email) => {
  const query = 'SELECT * FROM clients WHERE email = ?';
  const [rows] = await db.query(query, [email]);
  return rows.length ? rows[0] : null;
};

/**
 * Crea un nuevo cliente:
 *  - Encripta la contraseña con bcrypt.
 *  - Inserta en tabla clients.
 *  - Si admin_id existe, inserta en client_admins.
 */
exports.createClient = async ({ name, email, password, access_level, admin_id }) => {
  // 1) Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password.trim(), 12);

  // 2) Insertar en clients
  const insertQuery =
    'INSERT INTO clients (name, email, password, access_level_id, admin_id) VALUES (?, ?, ?, ?, ?)';
  const [result] = await db.query(insertQuery, [name.trim(), email.trim(), hashedPassword, access_level, admin_id || null]);

  if (result.affectedRows !== 1) {
    throw new AppError('No se pudo registrar el cliente', 500);
  }

  const newClientId = result.insertId;

  // 3) Si admin_id existe, insertar en client_admins
  if (admin_id) {
    const assocQuery = 'INSERT INTO client_admins (client_id, admin_id) VALUES (?, ?)';
    const [assocResult] = await db.query(assocQuery, [newClientId, admin_id]);
    if (assocResult.affectedRows !== 1) {
      throw new AppError('No se pudo asociar el cliente al admin', 500);
    }
  }

  // 4) Devolver el nuevo cliente (sin contraseña)
  return {
    _id: newClientId,
    name: name.trim(),
    email: email.trim(),
    access_level,
    admin_id: admin_id || null,
  };
};

/**
 * Actualiza nombre y email de un cliente.
 * @returns {boolean} true si se actualizó, false si no se encontró el cliente.
 */
exports.updateClient = async ({ id, name, email }) => {
  const updateQuery = 'UPDATE clients SET name = ?, email = ? WHERE client_id = ?';
  const [result] = await db.query(updateQuery, [name.trim(), email.trim(), id]);
  return result.affectedRows === 1;
};

/**
 * Devuelve array de client_ids asociados a un admin_id.
 * @param {number} adminId
 * @returns {number[]} Array de client_ids.
 */
exports.getAssociatedClientIds = async (adminId) => {
  const query = 'SELECT client_id FROM client_admins WHERE admin_id = ?';
  const [rows] = await db.query(query, [adminId]);
  return rows.map((r) => r.client_id);
};

/**
 * Dado un array de IDs, retorna los clientes correspondientes.
 * @param {number[]} idsArray
 * @returns {object[]} Array de objetos cliente.
 */
exports.getClientsByIds = async (idsArray) => {
  // MySQL acepta array en IN (?) en mysql2
  const query = 'SELECT client_id AS _id, name, email, access_level_id AS access_level, admin_id FROM clients WHERE client_id IN (?)';
  const [rows] = await db.query(query, [idsArray]);
  return rows;
};

/**
 * Elimina un cliente si no tiene dashboards asociados.
 * Devuelve:
 *  - 'not_found' si no existe el cliente
 *  - 'has_dependencies' si hay dashboards vinculados
 *  - true si se eliminó correctamente
 */
exports.deleteClient = async (clientId) => {
  // 1) Verificar existencia
  const [clientRows] = await db.query('SELECT * FROM clients WHERE client_id = ?', [clientId]);
  if (!clientRows.length) return 'not_found';

  // 2) Verificar dependencias en dashboards
  const [deps] = await db.query(
    'SELECT dashboard_id FROM dashboards WHERE additional_client_ids LIKE ?',
    [`%${clientId}%`]
  );
  if (deps.length) return 'has_dependencies';

  // 3) Eliminar en client_admins (si hubiera)
  await db.query('DELETE FROM client_admins WHERE client_id = ?', [clientId]);

  // 4) Eliminar en clients
  await db.query('DELETE FROM clients WHERE client_id = ?', [clientId]);
  return true;
};


/**
 * findById(clientId)
 * ------------------
 * Busca un cliente por su ID (client_id).
 * @param {number} clientId
 * @returns {Promise<object|null>} - { id, name, email, access_level, admin_id, password, password_changed_at } o null.
 */
exports.findById = async (clientId) => {
  const query = `
    SELECT
      client_id           AS id,
      name,
      email,
      password,
      access_level_id     AS role,
      admin_id
    FROM clients
    WHERE client_id = ?
    LIMIT 1
  `;
  const [rows] = await db.query(query, [clientId]);
  return rows.length ? rows[0] : null;
};