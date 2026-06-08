-- Add Books category to craft shop

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ProductCategory' AND e.enumlabel = 'BOOKS'
  ) THEN
    ALTER TYPE "ProductCategory" ADD VALUE 'BOOKS';
  END IF;
END
$$;

COMMIT;
