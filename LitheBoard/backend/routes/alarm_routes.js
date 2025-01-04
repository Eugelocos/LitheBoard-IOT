const express = require("express");
const router = express.Router();
const {
  getAlarmsByClientId,
  insterAlarm,
} = require("../controllers/api/alarm_controller");

router.get("/alarms/:client_id", getAlarmsByClientId);
router.post("/alarms/insert", insterAlarm);

module.exports = router;
