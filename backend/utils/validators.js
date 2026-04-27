/**
 * Validation helpers for user registration.
 */

/** Allowed university email domain */
const UNIVERSITY_DOMAIN = process.env.UNIVERSITY_DOMAIN || 'student.university.edu';

/**
 * Checks that the email ends with the configured university domain.
 * @param {string} email
 * @returns {boolean}
 */
function isUniversityEmail(email) {
    if (typeof email !== 'string') return false;
    return email.toLowerCase().endsWith(`@${UNIVERSITY_DOMAIN}`);
}

/**
 * Validates password strength:
 *  - At least 8 characters
 *  - Contains at least one digit
 * @param {string} password
 * @returns {{ valid: boolean, message?: string }}
 */
function validatePassword(password) {
    if (typeof password !== 'string' || password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number.' };
    }
    return { valid: true };
}

module.exports = { isUniversityEmail, validatePassword, UNIVERSITY_DOMAIN };
