const jwt = require('jsonwebtoken');

/**
 * Express middleware — Bearer JWT authentication guard.
 *
 * Reads the token from the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success: attaches the decoded payload to `req.user` and calls `next()`.
 * On failure: responds with 401 Unauthorized.
 *
 * @type {import('express').RequestHandler}
 */
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ error: 'Authentication token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { sub, email, firstName, lastName, iat, exp }
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session has expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid authentication token.' });
    }
}

module.exports = authenticate;
