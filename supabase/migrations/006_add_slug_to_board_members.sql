-- Add slug column to board_members table
-- This migration adds the slug field for individual board member pages
-- SAFE TO RUN: This migration is idempotent

-- Add slug column if it doesn't exist
ALTER TABLE public.board_members ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_board_members_slug ON public.board_members(slug);

