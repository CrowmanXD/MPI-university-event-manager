const { isUniversityEmail, validatePassword } = require('../../utils/validators');

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
