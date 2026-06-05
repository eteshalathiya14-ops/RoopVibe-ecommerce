const nodemailer = require("nodemailer");

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";

const usesRealSmtp = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporterPromise = null;

async function getTransporter() {
  if (!usesRealSmtp()) return null;
  if (transporterPromise) return transporterPromise;

  transporterPromise = Promise.resolve(
    nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  );
  return transporterPromise;
}

exports.usesRealSmtp = usesRealSmtp;

exports.sendVerificationEmail = async ({ to, name, token, otp }) => {
  const verifyUrl = `${getFrontendUrl()}/login?verifyToken=${encodeURIComponent(token)}`;
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "RoopVibe";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#1A1A1A">Verify your RoopVibe email</h2>
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#A07840">${otp}</p>
      <p>Or click the button below:</p>
      <p style="text-align:center;margin:28px 0">
        <a href="${verifyUrl}" style="background:#A07840;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
          Verify Email
        </a>
      </p>
      <p style="font-size:12px;color:#666">Link: <a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="font-size:12px;color:#999">Code and link expire in 24 hours.</p>
    </div>
  `;

  const transporter = await getTransporter();
  if (!transporter) {
    console.log("[email] SMTP not set — verification link:", verifyUrl);
    console.log("[email] Verification code for", to, ":", otp);
    return { sent: false, realDelivery: false, verifyUrl };
  }

  await transporter.sendMail({
    from: from.includes("<") ? from : `RoopVibe <${from}>`,
    to,
    subject: `${otp} — Verify your RoopVibe account`,
    html,
  });

  return { sent: true, realDelivery: true, verifyUrl };
};
