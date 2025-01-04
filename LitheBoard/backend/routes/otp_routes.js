const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtp } = require('../controllers/api/otp_controller'); 



/* `router.post('/request-otp', requestOtp);` is setting up a POST route in the Express router. When a
POST request is made to the '/request-otp' endpoint, the `requestOtp` function from the
'../controllers/api/otpController' file will be called to handle the request. */
router.post('/request-otp', requestOtp);


/* `router.post('/verify-otp', verifyOtp);` is setting up another POST route in the Express router.
When a POST request is made to the '/verify-otp' endpoint, the `verifyOtp` function from the
'../controllers/api/otp_controller' file will be called to handle the request. This route is likely
used for verifying the OTP (One-Time Password) entered by the user during the authentication
process. */
router.post('/verify-otp', verifyOtp);

module.exports = router;