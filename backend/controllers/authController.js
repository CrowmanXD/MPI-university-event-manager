const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../db/pool');
const { isUniversityEmail, validatePassword } = require('../utils/validators');
const { sendVerificationEmail } = require('../services/emailService');

/**
 * POST /api/auth/register
 *
 * Body: { email, password, firstName?, lastName? }
 *
 * Acceptance criteria enforced here:
 *  1. Email must end with the configured university domain.
 *  2. Password >= 8 chars and contains at least one number.
 *  3. A confirmation email is sent upon successful registration.
 */
async function register(req, res) {
    const { email, password, firstName, lastName } = req.body;

    // ── 1. Input presence ──────────────────────────────────────────────────
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    // ── 2. University email domain check ───────────────────────────────────
    if (!isUniversityEmail(email)) {
        const domain = process.env.UNIVERSITY_DOMAIN || 'student.university.edu';
        return res.status(400).json({
            error: `Only university email addresses are allowed (e.g. you@${domain}).`,
        });
    }

    // ── 3. Password strength check ─────────────────────────────────────────
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
        return res.status(400).json({ error: pwCheck.message });
    }

    // ── 4. Duplicate email ─────────────────────────────────────────────────
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // ── 5. Hash password & generate verification token ────────────────────
    const passwordHash  = await bcrypt.hash(password, 12);
    const verifyToken   = crypto.randomUUID();

    // ── 6. Persist user ────────────────────────────────────────────────────
    const insertResult = await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, verify_token)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name, last_name, created_at`,
        [email.toLowerCase(), passwordHash, firstName || null, lastName || null, verifyToken]
    );

    const newUser = insertResult.rows[0];

    // ── 7. Send confirmation email ─────────────────────────────────────────
    try {
        await sendVerificationEmail(newUser.email, verifyToken);
    } catch (emailErr) {
        // Registration succeeded – log the error but don't fail the request.
        console.error('Failed to send verification email:', emailErr.message);
    }

    return res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
            id:         newUser.id,
            email:      newUser.email,
            firstName:  newUser.first_name,
            lastName:   newUser.last_name,
            createdAt:  newUser.created_at,
        },
    });
}

/**
 * GET /api/auth/verify-email?token=<uuid>
 *
 * Marks the user's account as verified.
 */
async function verifyEmail(req, res) {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' });
    }

    const result = await pool.query(
        `UPDATE users
         SET is_verified = TRUE, verify_token = NULL, updated_at = NOW()
         WHERE verify_token = $1
         RETURNING id, email`,
        [token]
    );

    if (result.rowCount === 0) {
        return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }

    return res.status(200).json({
        message: 'Email verified successfully! You can now log in.',
        user: result.rows[0],
    });
}

module.exports = { register, verifyEmail };
