const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter from environment variables.
 * Supports any SMTP provider (Gmail, SendGrid, Mailtrap, etc.).
 *
 * Required env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional:
 *   SMTP_SECURE   – use TLS (default: false for port 587, true for 465)
 *   EMAIL_FROM    – sender address shown to recipients
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends a verification email to the newly registered student.
 *
 * @param {string} toEmail      - Recipient's email address
 * @param {string} token        - Unique verification token (UUID)
 * @returns {Promise<void>}
 */
async function sendVerificationEmail(toEmail, token) {
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:8080';
    const verifyLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"University Events" <no-reply@university.edu>',
        to: toEmail,
        subject: 'Confirm your University Events account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #4f46e5;">Welcome to University Events! 🎓</h2>
                <p>Thank you for registering. Please verify your email address by clicking the button below.</p>
                <a href="${verifyLink}"
                   style="display:inline-block;padding:12px 24px;background:#4f46e5;
                          color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
                    Verify my Email
                </a>
                <p style="margin-top:16px;color:#6b7280;font-size:13px;">
                    Or copy and paste this link into your browser:<br/>
                    <a href="${verifyLink}">${verifyLink}</a>
                </p>
                <p style="color:#6b7280;font-size:12px;">
                    This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.
                </p>
            </div>
        `,
    });
}

module.exports = { sendVerificationEmail };
