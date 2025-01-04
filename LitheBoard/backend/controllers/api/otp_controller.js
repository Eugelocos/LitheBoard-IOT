const {
  generateOtp,
  verifyOtpInDatabase,
} = require("../../services/otp_service");
const db = require("../../config/db");
const {sendOtpEmail} = require("../mail_controller")


/**
 * Namespace to separate APIs controllers
 * @namespace controllers.api.otp
 */

/**
 * 
 * The function `requestOtp` takes an email from a request, checks if it exists in the database,
 * generates an OTP for the corresponding client, and sends it via email, handling errors
 * appropriately.
 * @param {object} req - The `req` parameter in the `requestOtp` function represents the request object, which
 * contains information about the HTTP request that triggered the function. This object typically
 * includes properties such as `body` (containing the parsed request body), `params` (containing route
 * parameters), `query`
 * @param {object} res - The `res` parameter in the `requestOtp` function is the response object that will be
 * used to send responses back to the client making the request. It is typically used to send HTTP
 * responses with status codes, headers, and data back to the client. In the provided code snippet, `
 * @returns {object} The `requestOtp` function is returning different responses based on the outcome of the
 * database query and OTP generation/sending process:
 * @function 
 * @memberof controllers.api.otp
 */
const requestOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const [results] = await db
      .promise()
      .query("SELECT client_id FROM clients WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const client_id = results[0].client_id;

    try {
      const otp = await generateOtp(client_id, db);
      await sendOtpEmail(email, otp);

      res.status(200).json({ message: "OTP sent to email", otp: otp });
    } catch (err) {
      res
        .status(501)
        .json({ message: "Error generating OTP or sending email", error: err });
    }
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
};

/**
 * 
 * The function `verifyOtp` takes a client ID and OTP from the request body, verifies the OTP in the
 * database, and sends a response based on the verification result.
 * @param {object} req - The `req` parameter in the `verifyOtp` function typically represents the HTTP request
 * object, which contains information about the incoming request from the client, such as headers,
 * parameters, body, etc. In this specific function, `req.body` is used to extract the `client_id` and
 * @param {object} res - The `res` parameter in the `verifyOtp` function is the response object that will be
 * used to send the response back to the client making the request. It is typically an instance of the
 * Express response object in Node.js applications. The response object allows you to send HTTP
 * responses with data such
 * @function 
 * @memberof controllers.api.otp
 */
const verifyOtp = async (req, res) => {
  const { client_id, otp } = req.body;

  try {
    const verified = await verifyOtpInDatabase(client_id, otp, db);

    if (verified) {
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP", error: err });
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
};
