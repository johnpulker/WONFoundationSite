-- 030: Admin-managed gallery categories
--
-- Run this in the Supabase SQL Editor BEFORE deploying the matching code.
-- Safe to run more than once.
--
-- Replaces the fixed list of gallery categories (2022-2025 WW, Networking, Events,
-- Speakers) with a table the admin can add to, rename, reorder and delete from.

CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id text PRIMARY KEY,                 -- short code stored on each photo, e.g. '2026-ww'
  label text NOT NULL,                 -- what visitors see on the filter button, e.g. '2026 WW'
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Existing categories, in their current order
INSERT INTO public.gallery_categories (id, label, sort_order) VALUES
  ('2025-ww',    '2025 WW',    10),
  ('2024-ww',    '2024 WW',    20),
  ('2023-ww',    '2023 WW',    30),
  ('2022-ww',    '2022 WW',    40),
  ('networking', 'Networking', 100),
  ('events',     'Events',     110),
  ('speaker',    'Speakers',   120)
ON CONFLICT (id) DO NOTHING;

-- Safety net: any category already used by a photo must exist in the table
INSERT INTO public.gallery_categories (id, label, sort_order)
SELECT DISTINCT p.category, p.category, 200
FROM public.gallery_photos p
WHERE p.category IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Remove the old fixed list and the hard-coded default
ALTER TABLE public.gallery_photos DROP CONSTRAINT IF EXISTS gallery_photos_category_check;
ALTER TABLE public.gallery_photos ALTER COLUMN category DROP DEFAULT;

-- Every photo must point at a real category; a category in use can't be deleted
ALTER TABLE public.gallery_photos DROP CONSTRAINT IF EXISTS gallery_photos_category_fkey;
ALTER TABLE public.gallery_photos
  ADD CONSTRAINT gallery_photos_category_fkey
  FOREIGN KEY (category) REFERENCES public.gallery_categories(id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_gallery_categories_sort ON public.gallery_categories(sort_order);

-- Security: anyone can read categories (for the public filter buttons); only the server can change them
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can view gallery categories" ON public.gallery_categories;
CREATE POLICY "public can view gallery categories" ON public.gallery_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "service role manage gallery categories" ON public.gallery_categories;
CREATE POLICY "service role manage gallery categories" ON public.gallery_categories
  FOR ALL TO service_role USING (true) WITH CHECK (true);
