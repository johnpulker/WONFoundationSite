-- Add notes column to users table for admin-only member notes
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.users.notes IS 'Admin-only notes about the member (e.g., dietary restrictions, special accommodations). Not visible to members.';
