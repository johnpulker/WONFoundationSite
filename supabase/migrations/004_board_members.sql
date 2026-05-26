-- Board Members Schema
-- This migration adds the board_members table for managing the Board of Directors
-- SAFE TO RUN: This migration is idempotent (can run multiple times safely)

-- Board Members table
CREATE TABLE IF NOT EXISTS public.board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL, -- e.g., "President", "Vice President, Development", "Secretary", "Treasurer", "Director", "Nominating Committee Member"
  category text NOT NULL CHECK (category IN ('officer', 'director', 'nominating_committee')),
  profession text,
  bio text, -- Brief biography text
  bio_url text, -- Optional link to full bio (if bio text is too long)
  photo_url text,
  display_order integer DEFAULT 0, -- For ordering within category
  is_vacant boolean DEFAULT false, -- For vacant positions
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_board_members_category ON public.board_members(category);
CREATE INDEX IF NOT EXISTS idx_board_members_display_order ON public.board_members(display_order);

-- Row Level Security (RLS) Policies
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "public can view board members" ON public.board_members;
DROP POLICY IF EXISTS "service role manage board members" ON public.board_members;

-- Public can view board members
CREATE POLICY "public can view board members" ON public.board_members
  FOR SELECT USING (true);

-- Service role can manage board members
CREATE POLICY "service role manage board members" ON public.board_members
  FOR ALL TO service_role USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_board_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_board_members_updated_at ON public.board_members;

-- Create trigger
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_board_members_updated_at ON public.board_members;

-- Create trigger
CREATE TRIGGER update_board_members_updated_at
  BEFORE UPDATE ON public.board_members
  FOR EACH ROW
  EXECUTE FUNCTION update_board_members_updated_at();

