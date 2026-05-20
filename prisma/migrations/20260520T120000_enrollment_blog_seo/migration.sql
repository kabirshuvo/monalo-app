-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- AlterTable blogs (add columns; handle existing rows)
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(255);
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "excerpt" TEXT;
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP;
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "meta_title" VARCHAR(255);
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "meta_description" TEXT;
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "cover_image_url" TEXT;

UPDATE "blogs" SET "slug" = 'post-' || "id" WHERE "slug" IS NULL;
ALTER TABLE "blogs" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "blogs_slug_key" ON "blogs"("slug");
CREATE INDEX IF NOT EXISTS "blogs_slug_idx" ON "blogs"("slug");
CREATE INDEX IF NOT EXISTS "blogs_status_idx" ON "blogs"("status");

-- CreateIndex
CREATE INDEX "course_enrollments_user_id_idx" ON "course_enrollments"("user_id");
CREATE INDEX "course_enrollments_course_id_idx" ON "course_enrollments"("course_id");
CREATE UNIQUE INDEX "course_enrollments_user_id_course_id_deleted_at_key" ON "course_enrollments"("user_id", "course_id", "deleted_at");

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
