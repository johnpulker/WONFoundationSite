-- Add bio column to board_members table
-- This migration adds the bio text field for storing biography text
-- SAFE TO RUN: This migration is idempotent

-- Add bio column if it doesn't exist
ALTER TABLE public.board_members ADD COLUMN IF NOT EXISTS bio text;

