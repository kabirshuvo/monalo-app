-- CreateEnum
CREATE TYPE "ArtworkStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SOLD', 'INACTIVE');

-- CreateTable
CREATE TABLE "artist_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" VARCHAR(255),
    "bio" TEXT,
    "portfolio_url" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "artist_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artworks" (
    "id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "medium" VARCHAR(100),
    "dimensions" VARCHAR(100),
    "year" INTEGER,
    "image_url" TEXT,
    "status" "ArtworkStatus" NOT NULL DEFAULT 'DRAFT',
    "deleted_at" TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "artworks_pkey" PRIMARY KEY ("id")
);

-- AlterTable order_items: optional product, add artwork
ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "artwork_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "artist_profiles_user_id_key" ON "artist_profiles"("user_id");
CREATE UNIQUE INDEX "artworks_slug_deleted_at_key" ON "artworks"("slug", "deleted_at");
CREATE INDEX "artworks_artist_id_idx" ON "artworks"("artist_id");
CREATE INDEX "artworks_slug_idx" ON "artworks"("slug");
CREATE INDEX "artworks_status_idx" ON "artworks"("status");
CREATE INDEX "artworks_created_at_idx" ON "artworks"("created_at");
CREATE INDEX "artworks_deleted_at_idx" ON "artworks"("deleted_at");
CREATE INDEX "order_items_artwork_id_idx" ON "order_items"("artwork_id");

-- AddForeignKey
ALTER TABLE "artist_profiles" ADD CONSTRAINT "artist_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
