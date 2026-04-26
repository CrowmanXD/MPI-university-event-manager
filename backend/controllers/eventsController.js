const pool           = require('../db/pool');
const { validateEvent } = require('../utils/validators');

/**
 * POST /api/events
 *
 * Protected — requires a valid JWT (organizer must be logged in).
 * Body: { title, description, event_date, event_time, location, max_capacity }
 *
 * Acceptance criteria enforced here:
 *  1. All six fields are required.
 *  2. event_date must not be in the past.
 *  3. The created event is immediately persisted and returned.
 */
async function createEvent(req, res) {
    const { title, description, event_date, event_time, location, max_capacity } = req.body;

    // ── 1. Validate all fields ──────────────────────────────────────────────
    const check = validateEvent({ title, description, event_date, event_time, location, max_capacity });
    if (!check.valid) {
        return res.status(400).json({ error: check.message });
    }

    // ── 2. Persist ──────────────────────────────────────────────────────────
    const result = await pool.query(
        `INSERT INTO events (title, description, event_date, event_time, location, max_capacity, organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, description, event_date, event_time, location, max_capacity, organizer_id, created_at`,
        [
            title.trim(),
            description.trim(),
            event_date,
            event_time,
            location.trim(),
            Number(max_capacity),
            req.user.sub,   // set by authenticate middleware
        ]
    );

    const event = result.rows[0];

    return res.status(201).json({
        message: 'Event created successfully.',
        event,
    });
}

/**
 * GET /api/events
 *
 * Public — returns all upcoming events ordered by date/time ascending.
 * This powers the main dashboard so students can see events immediately
 * after an organizer creates one.
 */
async function listEvents(req, res) {
    const result = await pool.query(
        `SELECT
             e.id,
             e.title,
             e.description,
             e.event_date,
             e.event_time,
             e.location,
             e.max_capacity,
             e.organizer_id,
             e.created_at,
             u.first_name  AS organizer_first_name,
             u.last_name   AS organizer_last_name
         FROM   events e
         JOIN   users  u ON u.id = e.organizer_id
         WHERE  e.event_date >= CURRENT_DATE
         ORDER  BY e.event_date ASC, e.event_time ASC`
    );

    return res.status(200).json({ events: result.rows });
}

module.exports = { createEvent, listEvents };
