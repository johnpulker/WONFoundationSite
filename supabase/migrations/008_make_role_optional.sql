-- Make role column optional for board members
-- Director Members and Nominating Committee Members don't need roles
-- SAFE TO RUN: This migration is idempotent (can run multiple times safely)

-- Alter the role column to allow NULL values
ALTER TABLE public.board_members 
  ALTER COLUMN role DROP NOT NULL;

