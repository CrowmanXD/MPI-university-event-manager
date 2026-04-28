/**
 * Integration tests for PUT /api/events/:id (update event)
 */

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

const JWT_SECRET   = 'test_secret';
const ORGANIZER_ID = 7;
const ADMIN_ID     = 99;
const OTHER_USER_ID = 42;

function tomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
}

function nextWeek() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
}

function makeToken(payload = {}) {
    return jwt.sign(
        { sub: ORGANIZER_ID, email: 'organizer@student.university.edu', ...payload },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

function makeTokenForUser(sub) {
    return jwt.sign(
        { sub, email: `user${sub}@student.university.edu` },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

const VALID_TOKEN = makeToken();

function mockExistingEvent(overrides = {}) {
    pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
            id: 1,
            title: 'Original Title',
            description: 'Original Description',
            event_date: new Date(tomorrow()),
            event_time: '09:00:00',
            location: 'Original Location',
            max_capacity: 100,
            category: 'Workshop',
            image_url: 'https://example.com/image.jpg',
            organizer_id: ORGANIZER_ID,
            caller_is_admin: false,
            ...overrides,
        }],
    });
}

function mockUpdateEvent(overrides = {}) {
    pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
            id: 1,
            title: 'Updated Title',
            description: 'Original Description',
            event_date: tomorrow(),
            event_time: '09:00:00',
            location: 'Updated Location',
            max_capacity: 100,
            category: 'Workshop',
            image_url: 'https://example.com/image.jpg',
            organizer_id: ORGANIZER_ID,
            ...overrides,
        }],
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = JWT_SECRET;
});

describe('PUT /api/events/:id', () => {

    test('401 – rejects request with no token', async () => {
        const res = await request(app)
            .put('/api/events/1')
            .send({ title: 'New Title' });

        expect(res.status).toBe(401);
    });

    test('400 – rejects invalid event ID', async () => {
        const res = await request(app)
            .put('/api/events/abc')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send({ title: 'New Title' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid event id/i);
    });

    test('404 – returns 404 if event does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

        const res = await request(app)
            .put('/api/events/999')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send({ title: 'New Title' });

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });

    test('403 – rejects if user is not organizer and not admin', async () => {
        // Event belongs to ORGANIZER_ID, but we log in as OTHER_USER_ID
        mockExistingEvent({ organizer_id: ORGANIZER_ID, caller_is_admin: false });

        const res = await request(app)
            .put('/api/events/1')
            .set('Authorization', `Bearer ${makeTokenForUser(OTHER_USER_ID)}`)
            .send({ title: 'New Title' });

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/forbidden/i);
    });

    test('200 – succeeds if user is admin, even if not organizer', async () => {
        // Event belongs to ORGANIZER_ID, but caller is admin
        mockExistingEvent({ organizer_id: ORGANIZER_ID, caller_is_admin: true });
        mockUpdateEvent();

        const res = await request(app)
            .put('/api/events/1')
            .set('Authorization', `Bearer ${makeTokenForUser(ADMIN_ID)}`)
            .send({ title: 'Updated Title' });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/updated successfully/i);
    });

    test('200 – succeeds if user is organizer', async () => {
        mockExistingEvent({ organizer_id: ORGANIZER_ID, caller_is_admin: false });
        mockUpdateEvent({ title: 'Updated Title' });

        const res = await request(app)
            .put('/api/events/1')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send({ title: 'Updated Title' });

        expect(res.status).toBe(200);
        expect(res.body.event.title).toBe('Updated Title');
        expect(res.body.changes).toEqual({}); // No significant changes
    });

    test('200 – returns changes object when location is updated', async () => {
        mockExistingEvent({ location: 'Old Location' });
        mockUpdateEvent({ location: 'New Location' });

        const res = await request(app)
            .put('/api/events/1')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send({ location: 'New Location' });

        expect(res.status).toBe(200);
        expect(res.body.changes.location).toBeDefined();
        expect(res.body.changes.location.from).toBe('Old Location');
        expect(res.body.changes.location.to).toBe('New Location');
    });

    test('200 – returns changes object when date and time are updated', async () => {
        const oldDateStr = tomorrow();
        const newDateStr = nextWeek();
        
        mockExistingEvent({ 
            event_date: new Date(oldDateStr),
            event_time: '10:00:00'
        });
        mockUpdateEvent({ 
            event_date: newDateStr,
            event_time: '12:30'
        });

        const res = await request(app)
            .put('/api/events/1')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send({ event_date: newDateStr, event_time: '12:30' });

        expect(res.status).toBe(200);
        expect(res.body.changes.event_date.from).toBe(oldDateStr);
        expect(res.body.changes.event_date.to).toBe(newDateStr);
        expect(res.body.changes.event_time.from).toBe('10:00');
        expect(res.body.changes.event_time.to).toBe('12:30');
    });

    test('400 – validation fails on bad fields', async () => {
        mockExistingEvent();

        const res = await request(app)
            .put('/api/events/1')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send({ max_capacity: -10 });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/positive integer/i);
    });
});
