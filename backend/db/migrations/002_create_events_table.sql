-- Migration: 002_create_events_table
-- Description: Creates the events table for organizer-created events

CREATE TABLE IF NOT EXISTS events (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(255)  NOT NULL,
    description      TEXT          NOT NULL,
    event_date       DATE          NOT NULL,
    event_time       TIME          NOT NULL,
    location         VARCHAR(255)  NOT NULL,
    max_capacity     INTEGER       NOT NULL CHECK (max_capacity > 0),
    organizer_id     INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date      ON events(event_date);
