const express = require("express");
const router = express.Router();
const {
    getNotificationsByClientId,
    instertNotification,
    markNotificationAsRead
} = require("../controllers/api/notification_controller");

router.get("/notifications/get/:client_id", getNotificationsByClientId);
router.post("/notifications/insert", instertNotification);
router.post("/notifications/markAsRead/:notification_id",markNotificationAsRead);


module.exports=router;