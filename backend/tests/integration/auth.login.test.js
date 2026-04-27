/**
 * Integration tests for POST /api/auth/login
 *
 * The database pool and bcrypt are mocked so the suite runs without a real
 * Postgres instance. jsonwebtoken is NOT mocked — we verify the actual JWT
 * can be decoded with the same secret used to sign it.
 */

// ── Mocks ────────────────────────────────────────────────────────────────────
jest.mock('../../db/pool', () => {
    const mockQuery = jest.fn();
    return { query: mockQuery };
});

// Mock bcryptjs so password comparisons are instant and deterministic.
jest.mock('bcryptjs', () => ({
    hash:    jest.fn().mockResolvedValue('$hashed$'),
    compare: jest.fn(),
}));

// Email service is not invoked by login, but the authController imports it,
// so we provide a stub to prevent real SMTP calls.
jest.mock('../../services/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

const request  = require('supertest');
const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const pool     = require('../../db/pool');

const authRouter   = require('../../routes/auth');
const errorHandler = require('../../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(errorHandler);

// ── Constants ─────────────────────────────────────────────────────────────────
const VALID_EMAIL    = 'jane.doe@student.university.edu';
const VALID_PASSWORD = 'SecurePass1';
const JWT_TEST_SECRET = 'test_jwt_secret_for_unit_tests';

// ── Helpers ───────────────────────────────────────────────────────────────────
function mockVerifiedUser() {
    pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
            id:         42,
            email:      VALID_EMAIL,
            password:   '$hashed$',
            first_name: 'Jane',
            last_name:  'Doe',
            is_verified: true,
        }],
    });
}

function mockUnverifiedUser() {
    pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
            id:         43,
            email:      VALID_EMAIL,
            password:   '$hashed$',
            first_name: 'Jane',
            last_name:  'Doe',
            is_verified: false,
        }],
    });
}

function mockNoUser() {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
}

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
    jest.clearAllMocks();
    process.env.UNIVERSITY_DOMAIN = 'student.university.edu';
    process.env.JWT_SECRET        = JWT_TEST_SECRET;
    process.env.JWT_EXPIRES_IN    = '7d';
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {

    test('200 – returns a JWT and user info for valid credentials', async () => {
        mockVerifiedUser();
        bcrypt.compare.mockResolvedValueOnce(true);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/login successful/i);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe(VALID_EMAIL);

        // Verify the JWT is properly signed and contains expected claims
        const decoded = jwt.verify(res.body.token, JWT_TEST_SECRET);
        expect(decoded.sub).toBe(42);
        expect(decoded.email).toBe(VALID_EMAIL);
    });

    test('400 – rejects a request missing both email and password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('400 – rejects a request missing password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: VALID_EMAIL });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
    });

    test('401 – returns "Invalid credentials" for a non-existent email', async () => {
        mockNoUser();
        // bcrypt.compare still runs against a placeholder hash and returns false
        bcrypt.compare.mockResolvedValueOnce(false);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'ghost@student.university.edu', password: VALID_PASSWORD });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid credentials/i);
    });

    test('401 – returns "Invalid credentials" for a wrong password', async () => {
        mockVerifiedUser();
        bcrypt.compare.mockResolvedValueOnce(false);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: VALID_EMAIL, password: 'WrongPassword1' });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid credentials/i);
    });

    test('403 – rejects login for an unverified account', async () => {
        mockUnverifiedUser();
        bcrypt.compare.mockResolvedValueOnce(true);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/verify your email/i);
    });

    test('does NOT expose whether the email exists (same 401 for wrong email vs wrong password)', async () => {
        // Wrong email → 401
        mockNoUser();
        bcrypt.compare.mockResolvedValueOnce(false);
        const r1 = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@student.university.edu', password: 'any_pass' });

        // Wrong password → 401
        mockVerifiedUser();
        bcrypt.compare.mockResolvedValueOnce(false);
        const r2 = await request(app)
            .post('/api/auth/login')
            .send({ email: VALID_EMAIL, password: 'WrongPassword1' });

        expect(r1.status).toBe(401);
        expect(r2.status).toBe(401);
        expect(r1.body.error).toBe(r2.body.error); // same message
    });
});
