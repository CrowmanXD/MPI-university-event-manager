const { Router }     = require('express');
const { createEvent, listEvents, updateEvent } = require('../controllers/eventsController');
const authenticate   = require('../middleware/authenticate');

const router = Router();

/**
 * @route  GET /api/events
 * @desc   List all upcoming events (main dashboard feed)
 * @access Public
 */
router.get('/', asyncWrap(listEvents));

/**
 * @route  POST /api/events
 * @desc   Create a new event (organizer must be authenticated)
 * @access Private — Bearer JWT required
 */
router.post('/', authenticate, asyncWrap(createEvent));

/**
 * @route  PUT /api/events/:id
 * @desc   Update an existing event (organizer or admin only)
 * @access Private — Bearer JWT required
 */
router.put('/:id', authenticate, asyncWrap(updateEvent));

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
