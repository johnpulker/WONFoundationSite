-- Add guest_names column to event_registrations
-- Stores an array of guest names as JSON when multiple tickets are purchased
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS guest_names jsonb DEFAULT NULL;

COMMENT ON COLUMN event_registrations.guest_names IS 'JSON array of guest names when multiple tickets are purchased, e.g. ["Jane Doe", "Bob Smith"]';
