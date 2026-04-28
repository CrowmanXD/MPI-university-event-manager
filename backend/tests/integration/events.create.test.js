/**
 * Integration tests for POST /api/events  (create event)
 *                      GET  /api/events  (list events / dashboard)
 *
 * The database pool is mocked; jsonwebtoken is used for real so we can
 * generate genuine tokens to test the authentication guard.
 */

// ── Mocks ────────────────────────────────────────────────────────────────────
jest.mock('../../db/pool', () => ({ query: jest.fn() }));

const request  = require('supertest');
const express  = require('express');
const jwt      = require('jsonwebtoken');
const pool     = require('../../db/pool');

const eventsRouter = require('../../routes/events');
const errorHandler = require('../../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/events', eventsRouter);
app.use(errorHandler);

// ── Constants ─────────────────────────────────────────────────────────────────
const JWT_SECRET   = 'test_secret';
const ORGANIZER_ID = 7;

// Build a valid future date string (always tomorrow, so tests never go stale)
function tomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

const VALID_BODY = () => ({
    title:        'Spring Hackathon',
    description:  'A 24-hour coding competition open to all students.',
    event_date:   tomorrow(),
    event_time:   '09:00',
    location:     'Main Auditorium, Building A',
    max_capacity: 120,
    category:     'Workshop',
    image_url:    'https://example.com/image.jpg',
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeToken(payload = {}) {
    return jwt.sign(
        { sub: ORGANIZER_ID, email: 'organizer@student.university.edu', ...payload },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

const VALID_TOKEN = makeToken();

function mockInsert(overrides = {}) {
    pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
            id:           1,
            title:        'Spring Hackathon',
            description:  'A 24-hour coding competition open to all students.',
            event_date:   tomorrow(),
            event_time:   '09:00:00',
            location:     'Main Auditorium, Building A',
            max_capacity: 120,
            organizer_id: ORGANIZER_ID,
            created_at:   new Date().toISOString(),
            ...overrides,
        }],
    });
}

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = JWT_SECRET;
});

// ── POST /api/events ──────────────────────────────────────────────────────────
describe('POST /api/events', () => {

    test('201 – creates an event and returns it', async () => {
        mockInsert();

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(VALID_BODY());

        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/created successfully/i);
        expect(res.body.event.title).toBe('Spring Hackathon');
        expect(res.body.event.organizer_id).toBe(ORGANIZER_ID);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('401 – rejects request with no token', async () => {
        const res = await request(app)
            .post('/api/events')
            .send(VALID_BODY());

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/token is required/i);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('401 – rejects request with an invalid token', async () => {
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', 'Bearer this.is.garbage')
            .send(VALID_BODY());

        expect(res.status).toBe(401);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('401 – rejects an expired token', async () => {
        const expiredToken = jwt.sign(
            { sub: ORGANIZER_ID },
            JWT_SECRET,
            { expiresIn: '-1s' }   // already expired
        );

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${expiredToken}`)
            .send(VALID_BODY());

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/expired/i);
    });

    test('400 – rejects when title is missing', async () => {
        const body = VALID_BODY();
        delete body.title;

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/title/i);
    });

    test('400 – rejects when description is missing', async () => {
        const body = { ...VALID_BODY(), description: '' };

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/description/i);
    });

    test('400 – rejects when location is missing', async () => {
        const body = { ...VALID_BODY(), location: '   ' };

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/location/i);
    });

    test('400 – rejects a date in the past', async () => {
        const body = { ...VALID_BODY(), event_date: yesterday() };

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/past/i);
    });

    test('400 – rejects an invalid date format', async () => {
        const body = { ...VALID_BODY(), event_date: '26-04-2027' }; // DD-MM-YYYY

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/YYYY-MM-DD/i);
    });

    test('400 – rejects an invalid time format', async () => {
        const body = { ...VALID_BODY(), event_time: '9am' };

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/HH:MM/i);
    });

    test('400 – rejects max_capacity of zero', async () => {
        const body = { ...VALID_BODY(), max_capacity: 0 };

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/positive integer/i);
    });

    test('400 – rejects negative max_capacity', async () => {
        const body = { ...VALID_BODY(), max_capacity: -5 };

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/positive integer/i);
    });
});

// ── GET /api/events ───────────────────────────────────────────────────────────
describe('GET /api/events', () => {

    test('200 – returns upcoming events (no auth required)', async () => {
        pool.query.mockResolvedValueOnce({
            rowCount: 2,
            rows: [
                { id: 1, title: 'Spring Hackathon', event_date: tomorrow(), organizer_first_name: 'Alice', organizer_last_name: 'Smith' },
                { id: 2, title: 'AI Workshop',      event_date: tomorrow(), organizer_first_name: 'Bob',   organizer_last_name: 'Jones' },
            ],
        });

        const res = await request(app).get('/api/events');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events).toHaveLength(2);
        expect(res.body.events[0].title).toBe('Spring Hackathon');
    });

    test('200 – returns an empty array when no upcoming events exist', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

        const res = await request(app).get('/api/events');

        expect(res.status).toBe(200);
        expect(res.body.events).toEqual([]);
    });
});
