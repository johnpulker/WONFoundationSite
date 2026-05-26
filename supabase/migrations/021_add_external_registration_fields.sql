-- Add external registration fields to event_registrations_events table
ALTER TABLE public.event_registrations_events
ADD COLUMN IF NOT EXISTS use_external_registration BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.event_registrations_events
ADD COLUMN IF NOT EXISTS external_registration_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.event_registrations_events.use_external_registration IS 'When true, disables website registration form and uses external_registration_url instead';
COMMENT ON COLUMN public.event_registrations_events.external_registration_url IS 'URL to external registration page (used when use_external_registration is true)';
