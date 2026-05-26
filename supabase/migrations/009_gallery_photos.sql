-- Gallery Photos Schema
-- This migration adds the gallery_photos table for managing Moments of Celebration photos
-- SAFE TO RUN: This migration is idempotent (can run multiple times safely)

-- Gallery Photos table
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text NOT NULL,
  year integer NOT NULL,
  category text NOT NULL DEFAULT 'banquet' CHECK (category IN ('banquet', 'ceremony', 'networking', 'speaker', 'group', 'venue', 'other')),
  aspect_ratio text NOT NULL DEFAULT 'landscape' CHECK (aspect_ratio IN ('landscape', 'portrait', 'square')),
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_photos_year ON public.gallery_photos(year);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_category ON public.gallery_photos(category);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_display_order ON public.gallery_photos(display_order);

-- Row Level Security (RLS) Policies
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "public can view gallery photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "service role manage gallery photos" ON public.gallery_photos;

-- Public can view gallery photos
CREATE POLICY "public can view gallery photos" ON public.gallery_photos
  FOR SELECT USING (true);

-- Service role can manage gallery photos
CREATE POLICY "service role manage gallery photos" ON public.gallery_photos
  FOR ALL TO service_role USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_gallery_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_gallery_photos_updated_at ON public.gallery_photos;

-- Create trigger
CREATE TRIGGER update_gallery_photos_updated_at
  BEFORE UPDATE ON public.gallery_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_photos_updated_at();
