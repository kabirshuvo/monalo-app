-- Role applications + GUARDIAN / SPONSOR roles

BEGIN;

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GUARDIAN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SPONSOR';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RoleApplicationStatus') THEN
    CREATE TYPE "RoleApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "role_applications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "requested_roles" "Role"[] NOT NULL,
  "message" TEXT,
  "status" "RoleApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "assigned_role" "Role",
  "reviewed_by" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "admin_note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "role_applications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "role_applications_user_id_idx" ON "role_applications"("user_id");
CREATE INDEX IF NOT EXISTS "role_applications_status_idx" ON "role_applications"("status");
CREATE INDEX IF NOT EXISTS "role_applications_created_at_idx" ON "role_applications"("created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'role_applications_user_id_fkey'
  ) THEN
    ALTER TABLE "role_applications"
      ADD CONSTRAINT "role_applications_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

COMMIT;
