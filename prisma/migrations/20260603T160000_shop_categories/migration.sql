-- Craft shop product categories

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductCategory') THEN
    CREATE TYPE "ProductCategory" AS ENUM (
      'GYPSUM_POTTERY',
      'CANDLES',
      'WOOD_CRAFT',
      'BAMBOO_CRAFT',
      'OTHER_CRAFT'
    );
  END IF;
END
$$;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "category" "ProductCategory" NOT NULL DEFAULT 'OTHER_CRAFT';

CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products"("category");
CREATE INDEX IF NOT EXISTS "products_status_category_idx" ON "products"("status", "category");

COMMIT;
