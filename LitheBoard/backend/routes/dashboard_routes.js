const express = require("express");
const router = express.Router();
const {
  instertDashboard,
  getDahboardsByClientId,
  updateDashboard,
  deleteDahboard,
  assignDashboardToClient,
} = require("../controllers/api/dashboard_controller");

router.post("/dashboards/set", instertDashboard);
router.get("/data/dashboards/:client_id", getDahboardsByClientId);
router.put("/dashboards/update", updateDashboard);
router.delete("/dashboards/delete/:dashboard_id", deleteDahboard);
router.post("/assign-dashboard", assignDashboardToClient);

module.exports=router;
