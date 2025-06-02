// backend/routes/otp_routes.js
const express = require('express');
const router = express.Router();
const otpController = require('../controllers/api/otp_controller');
const { protect } = require('../middlewares/auth');
const { validateSchema } = require('../middlewares/validate');
const { requestOtpSchema, verifyOtpSchema } = require('../schemas/otpSchemas');

// Solicitar OTP (no necesita estar autenticado)
router.post('/request', validateSchema(requestOtpSchema), otpController.requestOtp);

// Verificar OTP (podría necesitar JWT o no, según tu flujo. Aquí asumimos sin JWT)
router.post('/verify', validateSchema(verifyOtpSchema), otpController.verifyOtp);

module.exports = router;
