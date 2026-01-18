-- Migration: add_last_login_to_user
-- Adds a nullable last_login_at timestamp column to users

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP;
