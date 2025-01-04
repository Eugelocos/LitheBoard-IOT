const express = require("express");
const router = express.Router();
const {
  login,
  getClientsByIds,
  getUserSession,
  logout,
  register,
  updateClient,
  getAsociatedClientsAdminsByAdminId,
} = require("../controllers/api/client_controller");

router.post("/login", login);
router.get("/clients_id-client/:clients_ids", getClientsByIds);
router.get("/user", getUserSession);
router.post("/logout", logout);
router.post("/register", register);
router.put("/user/update", updateClient);
router.get(
  "/asociatedClients-Admins/:admin_id",
  getAsociatedClientsAdminsByAdminId
);

module.exports = router;
