-- Migration: 003_add_edit_event_columns
-- Description: Adds columns needed for the "edit event" feature:
--   • users.is_admin          — lets admins edit any event regardless of ownership
--   • events.last_significant_change_at — timestamp of the last time/location change;
--     used by the frontend to visually highlight recent schedule/venue changes
--   • events.previous_event_date / previous_event_time / previous_location
--     — snapshot of the values that were replaced, so the UI can show a diff

-- ── users table ───────────────────────────────────────────────────────────────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ── events table ─────────────────────────────────────────────────────────────
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS last_significant_change_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS previous_event_date        DATE          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS previous_event_time        TIME          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS previous_location          VARCHAR(255)  DEFAULT NULL;
