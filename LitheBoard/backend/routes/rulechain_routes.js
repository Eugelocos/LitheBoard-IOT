const express = require("express");
const router = express.Router();
const {
  getRulechains,
  getRulechainById,
  insertRulechain,
  updateRulechain,
  deleteRulechain,
} = require("../controllers/api/rulechain_controller");

/**
 * @namespace controllers.api.rulechain
 */

/**
 * GET all rulechains for a user
 * Endpoint: /data/rulechains/get
 */
router.get("/data/rulechains/get", getRulechains);

/**
 * GET a single rulechain by ID
 * Endpoint: /data/rulechains/get/byId/:rulechain_id
 */
router.get("/data/rulechains/get/byId/:rulechain_id", getRulechainById);

/**
 * POST a new rulechain
 * Endpoint: /data/rulechains/insert
 */
router.post("/data/rulechains/insert", insertRulechain);

/**
 * PUT update an existing rulechain
 * Endpoint: /data/rulechains/update
 */
router.put("/data/rulechains/update", updateRulechain);

/**
 * DELETE a rulechain by ID
 * Endpoint: /data/rulechains/delete/:rulechain_id
 */
router.delete("/data/rulechains/delete/:rulechain_id", deleteRulechain);

module.exports = router;
