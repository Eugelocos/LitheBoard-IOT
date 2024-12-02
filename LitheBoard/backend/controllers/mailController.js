const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "litheboard@gmail.com", // Cambia esto por tu email
    pass: "xadh mvfk opqi dpih", // Cambia esto por tu contraseña
  },
});

const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: "LitheBoard IoT <no-reply@litheboard.io>",
    to: email,
    subject: "Tu código de inicio de sesión en dos pasos",
    html: `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }

        .container {
        width: 392px;
        max-height: 500px;
        height: 100%;
        border-radius: 16px;
        background-color: #6179c798;
        position: relative;
        border: 1px solid #232939e0;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .welcome-badge {
            background-color: #d4e2f7;
            color: #0073e6;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            font-size: 14px;
        }
        h3 {
            margin: 10px 0;
            font-size: 24px;
            color: #232939;
        }
        .card__body {

          align-items: center;
          text-align: center;
          background-color: #fff;
          border-radius: 90% / 7% 7% 0 0;
          border-bottom-right-radius: 16px;
          border-bottom-left-radius: 16px;
          position: relative;
          z-index: 4;
          height: 400px;
          padding: 12px 24px 0;
          overflow: hidden;
          gap: 16px;
            text-align: center;
        }
        .content {
            margin: 20px 0;
        }
        .expiry-text {
            color: #777;
            font-size: 14px;
        }
        .otp-code {
            font-size: 36px;
            color: #232939;
            font-weight: bold;
            letter-spacing: 5px;
        }
        .verification-instruction {
            font-size: 16px;
            margin-top: 20px;
            color: #444;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
        }
        .footer ul {
            list-style-type: none;
            padding: 0;
        }
        .footer li {
            margin-bottom: 10px;
        }
        .footer a {
            color: #0073e6;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>

    <table role="presentation" style="width: 392px;background-color: #6179c798; margin: auto;  height: 500px; overflow: hidden;   border-spacing: 0; border-collapse:separate;border:solid #232939e0 1px;border-radius:16px;">
      <tr >
          <td style="width: 392px; max-height: 500px;   padding: 0px; margin: 20px; ">
              <table role="presentation" style="width: 100%; border-collapse: collapse; height: 100%; ">
                  <tr style="height: 100px;">
                      <td style="text-align: center;  vertical-align: top; padding: 1.5rem; padding-top: 1rem; padding-bottom: 1rem; border-top-left-radius: 1.5rem; border-top-right-radius: 1.5rem;">
                          <div style="background-color: #d4e2f7; color: #0073e6; padding: 2px 10px; border-radius: 9999px; display: inline-block; font-size: 12px;">Welcome</div>
                          <h3 style="font-size: 24px; color: #232939e0; margin-top: 14px; font-weight: 600; white-space: nowrap; letter-spacing: -0.025rem; white-space: nowrap;">Email Verification Code</h3>
                      </td>
                  </tr>
                  <tr>
                      <td style="text-align: center; vertical-align: top; background-color: #fff; border-radius: 90% / 7% 7% 0 0; padding: 12px 24px; overflow: hidden; ">
                          <p style="    color: #6b7280;font-size: 0.75rem; margin-top: 10px;">This code expires in 5 minutes</p>
                          <p style="    font-size: 2.25rem;color: #232939; font-weight: bold; letter-spacing: 5px; ">${otp}</p>
                          <z style="height:16px; margin-bottom: 16px;">
                            <p style="width:fit-content; align-items: center;white-space: nowrap;border-radius: 9999px;border: 1px solid transparent;padding-left: 0.625rem;padding-right: 0.625rem;padding-top: 0.125rem;padding-bottom: 0.125rem;font-size: 0.75rem;font-weight: 600;background-color: #ede9fe;color: #232939e0;margin: auto;margin-top: 1rem;">Enter this code on the verification screen</p>
                          </z>
                          

                          <ul style="list-style-type: none; padding: 0; margin: 0;margin-top: 33px; font-size: 12px; color: #777;">
                              <li style="margin-top: 20px;font-size: 16px;color: #5c5b5b;margin: auto; margin-bottom: 8px;">
                                  <p>If you did not request this code, please disregard this email.</p>
                              </li>
                              <li style="font-size: 16px;margin: auto;color: #5c5b5b;font-weight: 600; margin-bottom: 8px;">
                                  <p>Best regards,<br />The LitheBoard IoT Team</p>
                              </li>
                              <li style="display: flex; align-items: center; margin: auto">
                                <footer style="margin-top: 20px; font-size: 12px; color: #888">
                                  <p>
                                    <a
                                      href="https://litheboard.io"
                                      style="color: #007bff; text-decoration: none"
                                      >Visit our website</a
                                    >
                                  </p>
                                  <p>
                                    This email was sent from an unmonitored mailbox. Please do not
                                    reply directly to this message.
                                  </p>
                                </footer>
                              </li>
                          </ul>                          
                      </td>
                   
                  </tr>
              </table>
          </td>
      </tr>
  </table>
</body>
</html>

    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
