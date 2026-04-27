/**
 * Integration tests for POST /api/events/:id/join
 */

jest.mock('../../db/pool', () => ({ 
    query: jest.fn(),
    connect: jest.fn(),
}));

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
const USER_ID      = 12;

function makeToken(payload = {}) {
    return jwt.sign(
        { sub: USER_ID, email: 'student@student.university.edu', ...payload },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

const VALID_TOKEN = makeToken();

describe('POST /api/events/:id/join', () => {
    let mockClient;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = JWT_SECRET;

        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        pool.connect.mockResolvedValue(mockClient);
    });

    test('200 – successfully joins an event', async () => {
        mockClient.query.mockImplementation(async (text) => {
            if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return {};
            if (text.includes('SELECT')) return { rows: [{ max_capacity: 100, current_registrations: 50 }] };
            if (text.includes('INSERT')) return { rows: [{ id: 1 }] };
            return { rows: [] };
        });

        const res = await request(app)
            .post('/api/events/1/join')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/Successfully joined/i);
        expect(res.body.available_spots).toBe(49);
    });

    test('400 – rejects if event is sold out', async () => {
        mockClient.query.mockImplementation(async (text) => {
            if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return {};
            if (text.includes('SELECT')) return { rows: [{ max_capacity: 10, current_registrations: 10 }] };
            return { rows: [] };
        });

        const res = await request(app)
            .post('/api/events/1/join')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Sold Out/i);
    });

    test('400 – rejects if already joined', async () => {
        mockClient.query.mockImplementation(async (text) => {
            if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return {};
            if (text.includes('SELECT')) return { rows: [{ max_capacity: 100, current_registrations: 50 }] };
            if (text.includes('INSERT')) return { rows: [] };
            return { rows: [] };
        });

        const res = await request(app)
            .post('/api/events/1/join')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/already joined/i);
    });

    test('404 – rejects if event not found', async () => {
        mockClient.query.mockImplementation(async (text) => {
            if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return {};
            if (text.includes('SELECT')) return { rows: [] };
            return { rows: [] };
        });

        const res = await request(app)
            .post('/api/events/999/join')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });
});
