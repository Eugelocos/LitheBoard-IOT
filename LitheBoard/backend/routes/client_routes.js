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
  deleteClient
} = require("../controllers/api/client_controller");

router.post("/login", login);
router.post("/register", register);

router.get("/user", getUserSession);
router.post("/logout", logout);
router.put("/user/update", updateClient);

router.delete("/clients/:client_id", deleteClient);
router.get("/asociatedClients-Admins/:admin_id", getAsociatedClientsAdminsByAdminId);
router.get("/clients_id-client/:clients_ids", getClientsByIds);


module.exports = router;
