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

/**
 * Validates event creation fields.
 *
 * Rules:
 *  - title, description, location must be non-empty strings
 *  - event_date must be a valid date string (YYYY-MM-DD) and not in the past
 *  - event_time must be a valid time string (HH:MM or HH:MM:SS)
 *  - max_capacity must be a positive integer
 *
 * @param {{ title, description, event_date, event_time, location, max_capacity, category, image_url }} fields
 * @returns {{ valid: boolean, message?: string }}
 */
function validateEvent({ title, description, event_date, event_time, location, max_capacity, category, image_url }) {
    if (!title || typeof title !== 'string' || !title.trim()) {
        return { valid: false, message: 'Title is required.' };
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
        return { valid: false, message: 'Description is required.' };
    }
    if (!location || typeof location !== 'string' || !location.trim()) {
        return { valid: false, message: 'Location is required.' };
    }
    if (!event_date || !/^\d{4}-\d{2}-\d{2}$/.test(event_date)) {
        return { valid: false, message: 'Date must be in YYYY-MM-DD format.' };
    }
    if (!event_time || !/^\d{2}:\d{2}(:\d{2})?$/.test(event_time)) {
        return { valid: false, message: 'Time must be in HH:MM or HH:MM:SS format.' };
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
        return { valid: false, message: 'Category is required.' };
    }
    if (!image_url || typeof image_url !== 'string' || !image_url.trim()) {
        return { valid: false, message: 'Image URL is required.' };
    }

    // Reject dates strictly in the past (compare date-only, ignore time-of-day)
    const today     = new Date();
    const todayStr  = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (event_date < todayStr) {
        return { valid: false, message: 'Event date cannot be in the past.' };
    }

    const capacity = Number(max_capacity);
    if (!Number.isInteger(capacity) || capacity <= 0) {
        return { valid: false, message: 'Maximum capacity must be a positive integer.' };
    }

    return { valid: true };
}

module.exports = { isUniversityEmail, validatePassword, validateEvent, UNIVERSITY_DOMAIN };
