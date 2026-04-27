/**
 * Integration tests for POST /api/auth/register
 *
 * These tests mock the database pool and the email service so they
 * run without a real Postgres instance or SMTP server.
 */

// ── Mocks ────────────────────────────────────────────────────────────────────
jest.mock('../../db/pool', () => {
    const mockQuery = jest.fn();
    return { query: mockQuery };
});

jest.mock('../../services/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

const request  = require('supertest');
const express  = require('express');
const pool     = require('../../db/pool');
const { sendVerificationEmail } = require('../../services/emailService');

// Build a minimal app (mirrors index.js setup)
const authRouter   = require('../../routes/auth');
const errorHandler = require('../../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(errorHandler);

// ── Helpers ──────────────────────────────────────────────────────────────────
const VALID_EMAIL    = 'john.doe@student.university.edu';
const VALID_PASSWORD = 'SecurePass1';

function mockDbNoExisting() {
    // First call: check for duplicate → no rows
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    // Second call: INSERT → return new user
    pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
            id: 1,
            email: VALID_EMAIL,
            first_name: 'John',
            last_name: 'Doe',
            created_at: new Date().toISOString(),
        }],
    });
}

// ── Tests ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
    jest.clearAllMocks();
    process.env.UNIVERSITY_DOMAIN = 'student.university.edu';
});

describe('POST /api/auth/register', () => {

    test('201 – registers a valid student account and sends a verification email', async () => {
        mockDbNoExisting();

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: VALID_EMAIL, password: VALID_PASSWORD, firstName: 'John', lastName: 'Doe' });

        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/check your email/i);
        expect(res.body.user.email).toBe(VALID_EMAIL);
        expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
        expect(sendVerificationEmail).toHaveBeenCalledWith(VALID_EMAIL, expect.any(String));
    });

    test('400 – rejects a non-university email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'hacker@gmail.com', password: VALID_PASSWORD });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/university email/i);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('400 – rejects a password shorter than 8 characters', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: VALID_EMAIL, password: 'abc1' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/8 characters/i);
    });

    test('400 – rejects a password without a number', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: VALID_EMAIL, password: 'NoNumbers' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/number/i);
    });

    test('400 – rejects a request missing both email and password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
    });

    test('409 – returns conflict when email is already registered', async () => {
        // Simulate email already exists in DB
        pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 99 }] });

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/already exists/i);
        expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    test('201 – still succeeds when the email service fails (graceful degradation)', async () => {
        mockDbNoExisting();
        sendVerificationEmail.mockRejectedValueOnce(new Error('SMTP timeout'));

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

        // User is registered even if the email failed to send
        expect(res.status).toBe(201);
    });
});

describe('GET /api/auth/verify-email', () => {

    test('200 – marks account as verified with a valid token', async () => {
        pool.query.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ id: 1, email: VALID_EMAIL }],
        });

        const res = await request(app)
            .get('/api/auth/verify-email')
            .query({ token: 'some-valid-uuid' });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/verified/i);
    });

    test('400 – rejects an invalid or expired token', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

        const res = await request(app)
            .get('/api/auth/verify-email')
            .query({ token: 'bad-token' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid or expired/i);
    });

    test('400 – rejects a request with no token', async () => {
        const res = await request(app).get('/api/auth/verify-email');

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
    });
});
