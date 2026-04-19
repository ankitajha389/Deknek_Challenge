const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = (to, token) =>
  sendEmail({
    to,
    subject: 'Verify your email address',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#111827">Verify your email</h2>
        <p style="color:#6b7280">Click the button below to verify your email address. This link expires in 24 hours.</p>
        <a href="${process.env.CLIENT_URL}/verify-email?token=${token}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="margin-top:24px;color:#9ca3af;font-size:12px">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });

const sendPasswordResetEmail = (to, token) =>
  sendEmail({
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#111827">Reset your password</h2>
        <p style="color:#6b7280">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${process.env.CLIENT_URL}/reset-password?token=${token}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="margin-top:24px;color:#9ca3af;font-size:12px">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
