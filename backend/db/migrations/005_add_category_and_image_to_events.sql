-- Migration: 005_add_category_and_image_to_events
-- Description: Adds category and image_url columns to events table

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'Workshop',
    ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80';
