// backend/routes/alarm_routes.js
const express = require('express');
const router = express.Router();
const alarmController = require('../controllers/api/alarm_controller');
const { validateSchema } = require('../middlewares/validate');
const { createAlarmSchema, getAlarmsSchema } = require('../schemas/alarm_schemas');
const { protect } = require('../middlewares/auth');

// Ruta GET /api/alarm/:client_id
router.get(
  '/:client_id',
  protect,
  validateSchema(getAlarmsSchema, 'params'),
  alarmController.getAlarmsByClientId
);

// Ruta POST /api/alarm
router.post(
  '/',
  protect,
  validateSchema(createAlarmSchema),
  alarmController.insertAlarm
);

module.exports = router;
