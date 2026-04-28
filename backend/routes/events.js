const { Router }     = require('express');
const { createEvent, listEvents, updateEvent, joinEvent, getEventById, getEventAttendees } = require('../controllers/eventsController');
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
 * @route  POST /api/events/:id/join
 * @desc   Join an event
 * @access Private — Bearer JWT required
 */
router.post('/:id/join', authenticate, asyncWrap(joinEvent));

/**
 * @route  GET /api/events/:id
 * @desc   Get full details of a specific event
 * @access Public
 */
router.get('/:id', asyncWrap(getEventById));

/**
 * @route  GET /api/events/:id/attendees
 * @desc   Get list of attendees for a specific event
 * @access Private — Bearer JWT required (organizer or admin)
 */
router.get('/:id/attendees', authenticate, asyncWrap(getEventAttendees));

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
