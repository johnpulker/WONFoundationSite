-- Add image_url field to event_registrations_events table
ALTER TABLE public.event_registrations_events 
ADD COLUMN IF NOT EXISTS image_url text;

