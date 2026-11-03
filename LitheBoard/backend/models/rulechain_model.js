const db = require("../config/db");

/**
 * Retrieve rulechains for a given client_id (client)
 * @param {object} req - Express request, expects req.query.client_id
 * @param {object} res - Express response
 */
async function getRulechains(client_id) {
  if (!client_id) {
    console.error("client_id is required");
    return null;
  }
  try {
    const query = `SELECT * FROM rulechains WHERE client_id = ?`;
    const [rows] = await db.query(query, [client_id]);
    return(rows);
  } catch (err) {
    console.error("Error fetching rulechains:", err);
    throw err;
  }
}

/**
 * Retrieve a single rulechain by its ID
 * @param {object} req - Express request, expects req.params.rulechain_id
 * @param {object} res - Express response
 */
async function getRulechainById(rulechain_id) {
  if (!rulechain_id) {
    return console.error("rulechain_id is required");
  }
  try {
    const query = `SELECT * FROM rulechains WHERE rulechain_id = ?`;
    const [rows] = await db.query(query, [rulechain_id]);
    if (rows.length === 0) {
      console.error("Rulechain not found" );
      return null;
    }
    return(rows[0]);
  } catch (err) {
    console.error("Error fetching rulechain:", err);
    throw err;
  }
}

module.exports = {
    getRulechains,
    getRulechainById
}
