-- Migration: remove_username_from_user
-- Drops the username column from the users table

BEGIN;

-- Safe drop: only if the column exists
ALTER TABLE "users" DROP COLUMN IF EXISTS "username";

COMMIT;
