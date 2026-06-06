-- CreateEnum
CREATE TYPE "BlogReactionType" AS ENUM ('LOVE', 'LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "blog_reactions" (
    "id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "BlogReactionType" NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "blog_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blog_reactions_blog_id_idx" ON "blog_reactions"("blog_id");

-- CreateIndex
CREATE INDEX "blog_reactions_user_id_idx" ON "blog_reactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_reactions_user_id_blog_id_key" ON "blog_reactions"("user_id", "blog_id");

-- AddForeignKey
ALTER TABLE "blog_reactions" ADD CONSTRAINT "blog_reactions_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_reactions" ADD CONSTRAINT "blog_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
