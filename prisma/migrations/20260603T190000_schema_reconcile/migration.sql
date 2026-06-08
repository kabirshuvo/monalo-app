-- Reconcile DB with prisma/schema.prisma (users profile/points, point_events, verification_tokens)

BEGIN;

-- PointCategory enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PointCategory') THEN
    CREATE TYPE "PointCategory" AS ENUM (
      'PURCHASE',
      'BLOG_READING',
      'LESSON_COMPLETE',
      'LEARNING'
    );
  END IF;
END
$$;

-- users: profile, points, email verification (NextAuth)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" TIMESTAMP;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "total_points" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "badge" VARCHAR(64);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "blog_reading_minutes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "learning_minutes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lessons_completed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "purchase_amount_taka" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'LEARNER';

-- point_events ledger
CREATE TABLE IF NOT EXISTS "point_events" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "category" "PointCategory" NOT NULL,
  "points" INTEGER NOT NULL,
  "description" VARCHAR(255),
  "reference_id" VARCHAR(128),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "point_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "point_events_user_id_created_at_idx"
  ON "point_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "point_events_category_idx"
  ON "point_events"("category");
CREATE UNIQUE INDEX IF NOT EXISTS "point_events_user_id_category_reference_id_key"
  ON "point_events"("user_id", "category", "reference_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'point_events_user_id_fkey'
  ) THEN
    ALTER TABLE "point_events"
      ADD CONSTRAINT "point_events_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- verification_tokens: align with NextAuth / Prisma adapter schema
DROP TABLE IF EXISTS "verification_tokens";

CREATE TABLE "verification_tokens" (
  "id" TEXT NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "token" VARCHAR(64) NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE INDEX "verification_tokens_email_idx" ON "verification_tokens"("email");
CREATE UNIQUE INDEX "verification_tokens_email_token_key" ON "verification_tokens"("email", "token");

-- role_applications: match Prisma @updatedAt (no DB default)
ALTER TABLE "role_applications" ALTER COLUMN "updated_at" DROP DEFAULT;

COMMIT;
