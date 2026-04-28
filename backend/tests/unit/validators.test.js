const { isUniversityEmail, validatePassword, validateEvent } = require('../../utils/validators');

describe('isUniversityEmail', () => {
    beforeAll(() => {
        // Ensure the env var is set for all tests in this file
        process.env.UNIVERSITY_DOMAIN = 'student.university.edu';
    });

    test('accepts a valid university email', () => {
        expect(isUniversityEmail('john.doe@student.university.edu')).toBe(true);
    });

    test('rejects a Gmail address', () => {
        expect(isUniversityEmail('john.doe@gmail.com')).toBe(false);
    });

    test('rejects an email with the domain as a subdomain of another', () => {
        expect(isUniversityEmail('hack@evil.student.university.edu.attacker.com')).toBe(false);
    });

    test('is case-insensitive', () => {
        expect(isUniversityEmail('John.Doe@STUDENT.UNIVERSITY.EDU')).toBe(true);
    });

    test('rejects an empty string', () => {
        expect(isUniversityEmail('')).toBe(false);
    });

    test('rejects a non-string value', () => {
        expect(isUniversityEmail(null)).toBe(false);
        expect(isUniversityEmail(42)).toBe(false);
    });
});

describe('validatePassword', () => {
    test('accepts a valid password with letters and numbers', () => {
        expect(validatePassword('SecurePass1')).toEqual({ valid: true });
    });

    test('rejects a password shorter than 8 characters', () => {
        const result = validatePassword('abc1');
        expect(result.valid).toBe(false);
        expect(result.message).toMatch(/8 characters/i);
    });

    test('rejects a password with no numbers', () => {
        const result = validatePassword('NoNumberHere');
        expect(result.valid).toBe(false);
        expect(result.message).toMatch(/number/i);
    });

    test('accepts password with exactly 8 characters and one number', () => {
        expect(validatePassword('abcdefg1')).toEqual({ valid: true });
    });

    test('rejects a non-string value', () => {
        expect(validatePassword(null).valid).toBe(false);
    });
});

// ── validateEvent ─────────────────────────────────────────────────────────────
describe('validateEvent', () => {
    function tomorrow() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
    }
    function yesterday() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10);
    }

    const valid = () => ({
        title:        'Tech Talk',
        description:  'An interesting talk about technology.',
        event_date:   tomorrow(),
        event_time:   '14:00',
        location:     'Room 101',
        max_capacity: 50,
        category:     'Workshop',
        image_url:    'https://example.com/image.jpg',
    });

    test('accepts a fully valid event', () => {
        expect(validateEvent(valid())).toEqual({ valid: true });
    });

    test('rejects missing title', () => {
        expect(validateEvent({ ...valid(), title: '' }).valid).toBe(false);
    });

    test('rejects blank description', () => {
        expect(validateEvent({ ...valid(), description: '   ' }).valid).toBe(false);
    });

    test('rejects missing location', () => {
        expect(validateEvent({ ...valid(), location: undefined }).valid).toBe(false);
    });

    test('rejects a past date', () => {
        const r = validateEvent({ ...valid(), event_date: yesterday() });
        expect(r.valid).toBe(false);
        expect(r.message).toMatch(/past/i);
    });

    test('rejects an invalid date format', () => {
        const r = validateEvent({ ...valid(), event_date: '26/04/2030' });
        expect(r.valid).toBe(false);
        expect(r.message).toMatch(/YYYY-MM-DD/i);
    });

    test('rejects an invalid time format', () => {
        const r = validateEvent({ ...valid(), event_time: '2pm' });
        expect(r.valid).toBe(false);
        expect(r.message).toMatch(/HH:MM/i);
    });

    test('accepts HH:MM:SS time format', () => {
        expect(validateEvent({ ...valid(), event_time: '14:00:00' })).toEqual({ valid: true });
    });

    test('rejects max_capacity of 0', () => {
        expect(validateEvent({ ...valid(), max_capacity: 0 }).valid).toBe(false);
    });

    test('rejects negative max_capacity', () => {
        expect(validateEvent({ ...valid(), max_capacity: -10 }).valid).toBe(false);
    });

    test('rejects non-integer max_capacity', () => {
        expect(validateEvent({ ...valid(), max_capacity: 1.5 }).valid).toBe(false);
    });

    test('rejects missing category', () => {
        expect(validateEvent({ ...valid(), category: '' }).valid).toBe(false);
    });

    test('rejects missing image_url', () => {
        expect(validateEvent({ ...valid(), image_url: '' }).valid).toBe(false);
    });
});

