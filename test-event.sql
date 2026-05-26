-- Test Event for Registration System
-- Run this in your Supabase SQL Editor to create a test event

-- Free Event (for testing without PayPal)
INSERT INTO public.event_registrations_events (
  slug, 
  name, 
  description, 
  date, 
  venue_name, 
  venue_address,
  city, 
  state, 
  postal_code, 
  country, 
  price_cents, 
  max_per_order, 
  is_active
) VALUES (
  'test-free-event',
  'Test Free Event',
  'This is a test event to verify the registration system works correctly. This event is free!',
  NOW() + INTERVAL '30 days',  -- Event in 30 days
  'Test Venue',
  '123 Test Street',
  'Detroit',
  'MI',
  '48201',
  'United States',
  0,  -- FREE event
  5,  -- Max 5 tickets per order
  true
);

-- Paid Event (for testing with PayPal)
INSERT INTO public.event_registrations_events (
  slug, 
  name, 
  description, 
  date, 
  venue_name, 
  venue_address,
  city, 
  state, 
  postal_code, 
  country, 
  price_cents, 
  max_per_order, 
  is_active
) VALUES (
  'test-paid-event',
  'Test Paid Event',
  'This is a test paid event to verify PayPal integration works correctly.',
  NOW() + INTERVAL '45 days',  -- Event in 45 days
  'Premium Venue',
  '456 Premium Avenue',
  'Detroit',
  'MI',
  '48201',
  'United States',
  2500,  -- $25.00
  3,  -- Max 3 tickets per order
  true
);

