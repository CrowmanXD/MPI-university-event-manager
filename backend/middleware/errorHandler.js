/**
 * Express error-handling middleware.
 * Catches any unhandled errors thrown inside async route handlers.
 * Must be registered AFTER all routes.
 *
 * @param {Error}  err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    console.error('[ERROR]', err);

    // Postgres unique-violation (email already exists)
    if (err.code === '23505') {
        return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
}

module.exports = errorHandler;
