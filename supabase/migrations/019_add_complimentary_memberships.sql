-- Add is_complimentary column to memberships table
ALTER TABLE public.memberships
ADD COLUMN IF NOT EXISTS is_complimentary BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.memberships.is_complimentary IS 'Indicates if this membership was provided as a complimentary membership (not counted in revenue)';
