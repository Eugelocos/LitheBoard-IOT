const db = require("../../config/db");
const {generateRulesEngineJson}=require("../../services/rulechain_service")
/**
 * Namespace for rulechain APIs
 * @namespace controllers.api.rulechain
 */

/**
 * Retrieve rulechains for a given user_id (client)
 * @param {object} req - Express request, expects req.query.user_id
 * @param {object} res - Express response
 */
const getRulechains = async (req, res) => {
  const { client_id } = req.query;
  if (!client_id) {
    return res.status(400).json({ message: "user_id is required" });
  }
  try {
    const query = `SELECT * FROM rulechain WHERE user_id = ?`;
    const [rows] = await db.promise().query(query, [client_id]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching rulechains:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

/**
 * Retrieve a single rulechain by its ID
 * @param {object} req - Express request, expects req.params.rulechain_id
 * @param {object} res - Express response
 */
const getRulechainById = async (req, res) => {
  const { rulechain_id } = req.params;
  try {
    const query = `SELECT * FROM rulechain WHERE rulechain_id = ?`;
    const [rows] = await db.promise().query(query, [rulechain_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Rulechain not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching rulechain:", err);
    res.status(500).json({ message: "Error fetching rulechain", error: err.message });
  }
};

/**
 * Insert a new rulechain record
 * @param {object} req - Express request, expects user_id, name, description, rulechain, entities_ids in body
 * @param {object} res - Express response
 */
const insertRulechain = async (req, res) => {
  const { user_id, name, description, rulechain: rcJson, entities_ids } = req.body;
  if (!user_id || !name || !rcJson || !entities_ids) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO rulechain 
        (user_id, name, description, rulechain, entities_ids)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      user_id,
      name,
      description || null,
      JSON.stringify(rcJson),
      JSON.stringify(entities_ids)
    ];
    const [result] = await db.promise().query(query, values);
    const newRulechain = {
      rulechain_id: result.insertId,
      user_id,
      name,
      description,
      rulechain: rcJson,
      entities_ids
    };
    res.status(201).json(newRulechain);
  } catch (err) {
    console.error("Error inserting rulechain:", err);
    res.status(500).json({ message: "Failed to insert rulechain", error: err.message });
  }
};

/**
 * Update an existing rulechain record
 * @param {object} req - Express request, expects rulechain_id, name, description, rulechain, entities_ids in body
 * @param {object} res - Express response
 */
const updateRulechain = async (req, res) => {
  const { rulechain_id, name, description, rulechain: rcJson, entities_ids} = req.body;
  const compiled= await generateRulesEngineJson(rcJson.nodes, rcJson.edges)
  if (!rulechain_id || !name || !rcJson || !entities_ids) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const query = `
      UPDATE rulechain
      SET name = ?, description = ?, rulechain = ?, entities_ids = ?, compiled = ?
      WHERE rulechain_id = ?
    `;
    const values = [
      name,
      description || null,
      JSON.stringify(rcJson),
      JSON.stringify(entities_ids),
      JSON.stringify(compiled),
      rulechain_id
    ];
    const [result] = await db.promise().query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rulechain not found" });
    }
    res.json({ message: "Rulechain updated" });
  } catch (err) {
    console.error("Error updating rulechain:", err);
    res.status(500).json({ message: "Failed to update rulechain", error: err.message });
  }
};

/**
 * Delete a rulechain by its ID
 * @param {object} req - Express request, expects req.params.rulechain_id
 * @param {object} res - Express response
 */
const deleteRulechain = async (req, res) => {
  const { rulechain_id } = req.params;
  try {
    const query = `DELETE FROM rulechain WHERE rulechain_id = ?`;
    const [result] = await db.promise().query(query, [rulechain_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rulechain not found" });
    }
    res.json({ message: "Rulechain deleted" });
  } catch (err) {
    console.error("Error deleting rulechain:", err);
    res.status(500).json({ message: "Failed to delete rulechain", error: err.message });
  }
};

module.exports = {
  getRulechains,
  getRulechainById,
  insertRulechain,
  updateRulechain,
  deleteRulechain,
};
