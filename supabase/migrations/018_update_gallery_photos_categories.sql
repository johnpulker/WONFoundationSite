-- Update gallery_photos category constraint to match new categories
-- Changes from: banquet, ceremony, networking, speaker, group, venue, other
-- To: 2025-ww, 2024-ww, 2023-ww, 2022-ww, networking, events, speaker

-- Drop the old constraint
ALTER TABLE public.gallery_photos 
  DROP CONSTRAINT IF EXISTS gallery_photos_category_check;

-- Add the new constraint with updated categories
ALTER TABLE public.gallery_photos 
  ADD CONSTRAINT gallery_photos_category_check 
  CHECK (category IN ('2025-ww', '2024-ww', '2023-ww', '2022-ww', 'networking', 'events', 'speaker'));

-- Update the default value
ALTER TABLE public.gallery_photos 
  ALTER COLUMN category SET DEFAULT '2025-ww';

-- Update any existing records with old categories to the closest new category
-- Map old categories to new ones:
-- banquet, ceremony, group, venue, other -> 2025-ww (most common for recent photos)
-- networking -> networking (unchanged)
-- speaker -> speaker (unchanged)
UPDATE public.gallery_photos 
SET category = CASE 
  WHEN category = 'networking' THEN 'networking'
  WHEN category = 'speaker' THEN 'speaker'
  ELSE '2025-ww'  -- Default old categories to 2025-ww
END
WHERE category NOT IN ('2025-ww', '2024-ww', '2023-ww', '2022-ww', 'networking', 'events', 'speaker');
