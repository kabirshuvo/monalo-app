-- Classroom Mode: teacher device, per-kid progress

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TEACHER';

-- Widen reference_id for classroom-prefixed keys (lp:{id}|{ref})
ALTER TABLE "point_events" ALTER COLUMN "reference_id" TYPE VARCHAR(191);

ALTER TABLE "point_events" ADD COLUMN IF NOT EXISTS "learner_profile_id" TEXT;

CREATE TABLE IF NOT EXISTS "classrooms" (
  "id" TEXT NOT NULL,
  "teacher_id" TEXT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "school_name" VARCHAR(160),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL,
  CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "learner_profiles" (
  "id" TEXT NOT NULL,
  "classroom_id" TEXT NOT NULL,
  "display_name" VARCHAR(80) NOT NULL,
  "avatar_key" VARCHAR(32) NOT NULL DEFAULT 'penguin',
  "roll_no" VARCHAR(32),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL,
  CONSTRAINT "learner_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "classrooms_teacher_id_idx" ON "classrooms"("teacher_id");
CREATE INDEX IF NOT EXISTS "learner_profiles_classroom_id_idx" ON "learner_profiles"("classroom_id");
CREATE INDEX IF NOT EXISTS "point_events_learner_profile_id_category_idx" ON "point_events"("learner_profile_id", "category");

DO $$ BEGIN
  ALTER TABLE "classrooms"
    ADD CONSTRAINT "classrooms_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "learner_profiles"
    ADD CONSTRAINT "learner_profiles_classroom_id_fkey"
    FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "point_events"
    ADD CONSTRAINT "point_events_learner_profile_id_fkey"
    FOREIGN KEY ("learner_profile_id") REFERENCES "learner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
