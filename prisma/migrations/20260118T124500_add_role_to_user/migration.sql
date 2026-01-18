-- Migration: add_role_to_user
-- Adds a `role` column of type Role to the users table with default BROWSER

BEGIN;

-- Create enum type "Role" if it does not already exist (case-insensitive check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE lower(typname) = 'role'
  ) THEN
    CREATE TYPE "Role" AS ENUM ('ADMIN','CUSTOMER','LEARNER','WRITER','SELLER','DONOR','BROWSER');
  END IF;
END
$$;

-- Add the role column to users if it doesn't exist, defaulting to 'BROWSER'
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'BROWSER';

COMMIT;
