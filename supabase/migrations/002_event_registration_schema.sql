-- Event Registration Schema
-- This migration adds the events and registrations tables for the event registration system

-- Events table (enhanced version for registration system)
CREATE TABLE IF NOT EXISTS public.event_registrations_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  date timestamptz NOT NULL,
  venue_name text,
  venue_address text,
  city text,
  state text,
  postal_code text,
  country text,
  latitude double precision,
  longitude double precision,
  price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  max_per_order int NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.event_registrations_events(id) NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  tickets int NOT NULL DEFAULT 1,
  registration_type text DEFAULT 'individual', -- 'individual' | 'business'
  is_anonymous boolean NOT NULL DEFAULT false,
  public_message text,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  payment_status text NOT NULL DEFAULT 'free', -- 'free' | 'pending' | 'paid' | 'failed'
  payment_provider text, -- 'paypal'
  payment_id text, -- PayPal order ID
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON public.event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_id ON public.event_registrations(payment_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_events_slug ON public.event_registrations_events(slug);
CREATE INDEX IF NOT EXISTS idx_event_registrations_events_is_active ON public.event_registrations_events(is_active);

-- Row Level Security (RLS) Policies
-- Enable RLS on registrations table
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for server-side operations)
CREATE POLICY "service role insert" ON public.event_registrations
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "service role select" ON public.event_registrations
  FOR SELECT TO service_role USING (true);

CREATE POLICY "service role update" ON public.event_registrations
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- Public can read active events (for the event page)
ALTER TABLE public.event_registrations_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can view active events" ON public.event_registrations_events
  FOR SELECT USING (is_active = true);

-- Service role can manage events
CREATE POLICY "service role manage events" ON public.event_registrations_events
  FOR ALL TO service_role USING (true);

