const { Router } = require('express');
const { register, verifyEmail } = require('../controllers/authController');

const router = Router();

/**
 * @route  POST /api/auth/register
 * @desc   Register a new student account
 * @access Public
 */
router.post('/register', asyncWrap(register));

/**
 * @route  GET /api/auth/verify-email?token=<uuid>
 * @desc   Verify the student's email address
 * @access Public
 */
router.get('/verify-email', asyncWrap(verifyEmail));

/**
 * Wraps an async route handler so errors are forwarded to the global
 * error-handling middleware instead of crashing the process.
 *
 * @param {Function} fn - async Express handler
 * @returns {Function}
 */
function asyncWrap(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = router;
