const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use Gmail App Password
  },
});

const sendOTPEmail = async (toEmail, otp, userName = "User") => {
  const mailOptions = {
    from: `"Rozgar Hub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Verification Code - Rozgar Hub",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; text-align: center; }
          .header h1 { color: #e94560; margin: 0; font-size: 28px; letter-spacing: 2px; }
          .header p { color: #aaa; margin: 5px 0 0; font-size: 13px; }
          .body { padding: 40px 30px; text-align: center; }
          .body p { color: #555; font-size: 15px; line-height: 1.6; }
          .otp-box { background: #f0f4ff; border: 2px dashed #e94560; border-radius: 10px; padding: 20px; margin: 25px auto; display: inline-block; }
          .otp-code { font-size: 42px; font-weight: 900; color: #1a1a2e; letter-spacing: 10px; }
          .expiry { color: #e94560; font-size: 13px; margin-top: 8px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #aaa; font-size: 12px; }
          .warning { color: #e94560; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ROZGAR HUB</h1>
            <p>Pakistan's Trusted Job Platform</p>
          </div>
          <div class="body">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Use the OTP below to verify your email address. This code is valid for <strong>10 minutes</strong>.</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="expiry">⏰ Expires in 10 minutes</div>
            </div>
            <p class="warning">⚠️ Do NOT share this OTP with anyone.</p>
            <p style="color:#aaa; font-size:13px;">If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Rozgar Hub. All rights reserved.<br/>
            This is an automated email, please do not reply.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendSOSEmail = async ({ toEmail, contactName, workerName, workerPhone, lat, lng, address, mapsUrl, message, sosId }) => {
  const mailOptions = {
    from: `"Rozgar Hub Emergency" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🚨 EMERGENCY SOS ALERT - " + workerName,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 30px rgba(220,38,38,0.2); border-top: 5px solid #dc2626; }
          .header { background: linear-gradient(135deg, #dc2626, #991b1b); padding: 30px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 32px; letter-spacing: 1px; }
          .header p { color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px; }
          .body { padding: 30px; }
          .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
          .alert-box h2 { color: #dc2626; margin: 0 0 10px; font-size: 18px; }
          .info-row { display: flex; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: 700; color: #374151; min-width: 120px; }
          .info-value { color: #555; flex: 1; }
          .location-btn { display: inline-block; background: #3b82f6; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .message-box { background: #f9fafb; border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin: 20px 0; font-style: italic; color: #555; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; }
          .warning { color: #dc2626; font-weight: 700; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 EMERGENCY ALERT</h1>
            <p>A person you know has triggered an SOS emergency signal</p>
          </div>
          <div class="body">
            <div class="alert-box">
              <h2>⚠️ Emergency Contact Notification</h2>
              <p style="margin: 0; color: #666;">You have been designated as an emergency contact for this worker.</p>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">⏰ Immediate Action Required</p>
              <p style="margin: 5px 0 0; color: #92400e; font-size: 14px;">Please contact ${workerName} immediately or call local emergency services (1122).</p>
            </div>

            <h3 style="color: #1f2937; margin-top: 25px;">Worker Details:</h3>
            <div class="info-row">
              <div class="info-label">Name:</div>
              <div class="info-value"><strong>${workerName}</strong></div>
            </div>
            <div class="info-row">
              <div class="info-label">Phone:</div>
              <div class="info-value"><a href="tel:${workerPhone}" style="color: #3b82f6; text-decoration: none;">${workerPhone}</a></div>
            </div>
            <div class="info-row">
              <div class="info-label">Location:</div>
              <div class="info-value">${address}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Coordinates:</div>
              <div class="info-value">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
            </div>

            <center>
              <a href="${mapsUrl}" target="_blank" class="location-btn">📍 View Location on Maps</a>
            </center>

            ${message ? `<div class="message-box"><strong>Additional Message:</strong><br/>${message}</div>` : ''}

            <div class="warning">
              ⚠️ IMPORTANT: This is an automated emergency alert. Please verify the situation before calling emergency services.
            </div>

            <p style="color: #666; font-size: 13px; margin-top: 20px;">
              <strong>SOS Reference ID:</strong> ${sosId}<br/>
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Rozgar Hub. Emergency Services Support.<br/>
            This is an automated emergency notification. Do not reply to this email.<br/>
            <strong>In life-threatening situations, call 1122 (Pakistan) or your local emergency number.</strong>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendSOSEmail };