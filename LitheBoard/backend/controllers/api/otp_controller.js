// backend/controllers/api/otp_controller.js

const AppError = require('../../utils/app_error');
const OtpService = require('../../services/dbServices/otp_service');
const { sendOtpEmail } = require('../mail_controller');
const { sendNoContent } = require('../../utils/response');

/**
 * POST /api/otp/request
 * Solicita un OTP para el email indicado: verifica que el cliente exista, genera OTP y envía correo.
 * Responde 204: el código nunca viaja en la respuesta.
 */
exports.requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Se asume validateSchema(requestOtpSchema) antes de este controller

    // Internamente, el service valida existencia de email en clients, genera OTP y lo guarda en BD
    const { otp } = await OtpService.generateAndStoreOtp(email);

    await sendOtpEmail(email, otp);

    return sendNoContent(res);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/otp/verify
 * Verifica que el OTP proporcionado coincida para el client_id dado.
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { client_id, otp } = req.body;
    // Se asume validateSchema(verifyOtpSchema) antes de este controller

    const isValid = await OtpService.verifyOtp(client_id, otp);
    if (!isValid) {
      return next(new AppError('Código OTP inválido o vencido', 400, 'OTP_INVALID'));
    }
    return sendNoContent(res);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};
