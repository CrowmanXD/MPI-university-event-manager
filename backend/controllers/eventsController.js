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
             e.updated_at,
             e.last_significant_change_at,
             e.previous_event_date,
             e.previous_event_time,
             e.previous_location,
             u.first_name  AS organizer_first_name,
             u.last_name   AS organizer_last_name
         FROM   events e
         JOIN   users  u ON u.id = e.organizer_id
         WHERE  e.event_date >= CURRENT_DATE
         ORDER  BY e.event_date ASC, e.event_time ASC`
    );

    return res.status(200).json({ events: result.rows });
}

/**
 * PUT /api/events/:id
 *
 * Protected — only the event's organizer or an admin may edit it.
 * Body (all optional — send only the fields you want to change):
 *   { title, description, event_date, event_time, location, max_capacity }
 *
 * Acceptance criteria enforced here:
 *  1. The caller must be authenticated (checked in the route via `authenticate`).
 *  2. Only the organizer who created the event OR a user with is_admin=true
 *     may perform this action (returns 403 otherwise).
 *  3. The same field-level validation rules as creation apply.
 *  4. If event_date, event_time, or location changes the previous values are
 *     stored in previous_event_date / previous_event_time / previous_location
 *     and last_significant_change_at is set to NOW() so the frontend can
 *     visually highlight the change.
 *  5. updated_at is always refreshed on a successful edit.
 */
async function updateEvent(req, res) {
    const eventId = parseInt(req.params.id, 10);
    if (!Number.isInteger(eventId) || eventId <= 0) {
        return res.status(400).json({ error: 'Invalid event ID.' });
    }

    // ── 1. Load the existing event ───────────────────────────────────────────
    const existing = await pool.query(
        `SELECT e.*, u.is_admin AS caller_is_admin
         FROM   events e
         JOIN   users  u ON u.id = $1
         WHERE  e.id = $2`,
        [req.user.sub, eventId]
    );

    if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found.' });
    }

    const event = existing.rows[0];

    // ── 2. Authorization: organizer or admin ─────────────────────────────────
    const isOwner = event.organizer_id === req.user.sub;
    const isAdmin = Boolean(event.caller_is_admin);
    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            error: 'Forbidden. Only the event organizer or an admin can edit this event.',
        });
    }

    // ── 3. Merge incoming fields with existing values ────────────────────────
    const { title, description, event_date, event_time, location, max_capacity } = req.body;

    const newTitle       = title        !== undefined ? title        : event.title;
    const newDescription = description  !== undefined ? description  : event.description;
    const newDate        = event_date   !== undefined ? event_date   : event.event_date.toISOString().slice(0, 10);
    const newTime        = event_time   !== undefined ? event_time   : event.event_time.slice(0, 5);
    const newLocation    = location     !== undefined ? location     : event.location;
    const newCapacity    = max_capacity !== undefined ? max_capacity : event.max_capacity;

    // ── 4. Validate merged values ────────────────────────────────────────────
    const check = validateEvent({
        title:        newTitle,
        description:  newDescription,
        event_date:   newDate,
        event_time:   newTime,
        location:     newLocation,
        max_capacity: newCapacity,
    });
    if (!check.valid) {
        return res.status(400).json({ error: check.message });
    }

    // ── 5. Detect significant changes (date, time, location) ─────────────────
    const oldDate     = event.event_date.toISOString().slice(0, 10);
    const oldTime     = event.event_time.slice(0, 5);
    const oldLocation = event.location;

    const dateChanged     = newDate     !== oldDate;
    const timeChanged     = newTime     !== oldTime;
    const locationChanged = newLocation.trim() !== oldLocation.trim();
    const hasSignificantChange = dateChanged || timeChanged || locationChanged;

    // ── 6. Persist ───────────────────────────────────────────────────────────
    const updated = await pool.query(
        `UPDATE events
         SET
             title                    = $1,
             description              = $2,
             event_date               = $3,
             event_time               = $4,
             location                 = $5,
             max_capacity             = $6,
             updated_at               = NOW(),
             previous_event_date      = CASE WHEN $7 THEN event_date      ELSE previous_event_date      END,
             previous_event_time      = CASE WHEN $7 THEN event_time      ELSE previous_event_time      END,
             previous_location        = CASE WHEN $7 THEN location        ELSE previous_location        END,
             last_significant_change_at = CASE WHEN $7 THEN NOW()         ELSE last_significant_change_at END
         WHERE id = $8
         RETURNING
             id, title, description, event_date, event_time, location, max_capacity,
             organizer_id, created_at, updated_at,
             last_significant_change_at,
             previous_event_date, previous_event_time, previous_location`,
        [
            newTitle.trim(),
            newDescription.trim(),
            newDate,
            newTime,
            newLocation.trim(),
            Number(newCapacity),
            hasSignificantChange,   // $7 — boolean flag
            eventId,                // $8
        ]
    );

    const updatedEvent = updated.rows[0];

    // ── 7. Build a human-readable diff for the response ──────────────────────
    const changes = {};
    if (dateChanged)     changes.event_date = { from: oldDate,             to: newDate };
    if (timeChanged)     changes.event_time = { from: oldTime,             to: newTime };
    if (locationChanged) changes.location   = { from: oldLocation.trim(),  to: newLocation.trim() };

    return res.status(200).json({
        message: 'Event updated successfully.',
        event:   updatedEvent,
        changes,   // empty object {} when only non-significant fields changed
    });
}

module.exports = { createEvent, listEvents, updateEvent };
