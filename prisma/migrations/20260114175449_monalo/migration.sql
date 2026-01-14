-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER', 'LEARNER', 'WRITER', 'SELLER', 'DONOR', 'BROWSER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "name" VARCHAR(255),
    "avatar" TEXT,
    "phone" VARCHAR(32),
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "badge" VARCHAR(255) NOT NULL DEFAULT 'New Light',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "sku" VARCHAR(100),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "image_url" TEXT,
    "deleted_at" TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" VARCHAR(255),
    "order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total_amount" INTEGER NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "payment_method" VARCHAR(50),
    "payment_id" VARCHAR(255),
    "stripe_session_id" VARCHAR(255),
    "deleted_at" TIMESTAMP,
    "shipping_address" TEXT,
    "shipping_status" VARCHAR(50),
    "tracking_number" VARCHAR(100),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "paid_at" TIMESTAMP,
    "shipped_at" TIMESTAMP,
    "delivered_at" TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_snapshot" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "price" INTEGER,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,
    "deleted_at" TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "video_url" TEXT,
    "order" INTEGER NOT NULL,
    "duration" INTEGER,
    "deleted_at" TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lesson_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP,
    "watched_minutes" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "route" VARCHAR(255),
    "reason" TEXT,
    "user_role" VARCHAR(50),
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP,
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT,
    "deleted_at" TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_rules" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "points" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "points_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "users_points_idx" ON "users"("points");

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "users"("last_login_at");

-- CreateIndex
CREATE INDEX "users_email_deleted_at_idx" ON "users"("email", "deleted_at");

-- CreateIndex
CREATE INDEX "users_role_created_at_idx" ON "users"("role", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_deleted_at_key" ON "users"("email", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_deleted_at_key" ON "users"("username", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");

-- CreateIndex
CREATE INDEX "products_stock_idx" ON "products"("stock");

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "products"("deleted_at");

-- CreateIndex
CREATE INDEX "products_status_stock_idx" ON "products"("status", "stock");

-- CreateIndex
CREATE INDEX "products_status_created_at_idx" ON "products"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_deleted_at_key" ON "products"("slug", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_deleted_at_key" ON "products"("sku", "deleted_at");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

-- CreateIndex
CREATE INDEX "product_images_deleted_at_idx" ON "product_images"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripe_session_id_key" ON "orders"("stripe_session_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_payment_id_idx" ON "orders"("payment_id");

-- CreateIndex
CREATE INDEX "orders_deleted_at_idx" ON "orders"("deleted_at");

-- CreateIndex
CREATE INDEX "orders_user_id_status_idx" ON "orders"("user_id", "status");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "orders_payment_status_created_at_idx" ON "orders"("payment_status", "created_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "order_items_deleted_at_idx" ON "order_items"("deleted_at");

-- CreateIndex
CREATE INDEX "courses_title_idx" ON "courses"("title");

-- CreateIndex
CREATE INDEX "courses_created_at_idx" ON "courses"("created_at");

-- CreateIndex
CREATE INDEX "courses_is_paid_idx" ON "courses"("is_paid");

-- CreateIndex
CREATE INDEX "courses_deleted_at_idx" ON "courses"("deleted_at");

-- CreateIndex
CREATE INDEX "courses_is_paid_created_at_idx" ON "courses"("is_paid", "created_at");

-- CreateIndex
CREATE INDEX "lessons_course_id_idx" ON "lessons"("course_id");

-- CreateIndex
CREATE INDEX "lessons_created_at_idx" ON "lessons"("created_at");

-- CreateIndex
CREATE INDEX "lessons_deleted_at_idx" ON "lessons"("deleted_at");

-- CreateIndex
CREATE INDEX "lessons_course_id_order_idx" ON "lessons"("course_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_course_id_order_deleted_at_key" ON "lessons"("course_id", "order", "deleted_at");

-- CreateIndex
CREATE INDEX "user_lesson_progress_user_id_idx" ON "user_lesson_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_lesson_progress_course_id_idx" ON "user_lesson_progress"("course_id");

-- CreateIndex
CREATE INDEX "user_lesson_progress_lesson_id_idx" ON "user_lesson_progress"("lesson_id");

-- CreateIndex
CREATE INDEX "user_lesson_progress_completed_idx" ON "user_lesson_progress"("completed");

-- CreateIndex
CREATE INDEX "user_lesson_progress_deleted_at_idx" ON "user_lesson_progress"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_lesson_progress_user_id_lesson_id_deleted_at_key" ON "user_lesson_progress"("user_id", "lesson_id", "deleted_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_timestamp_idx" ON "activity_logs"("timestamp");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_deleted_at_idx" ON "activity_logs"("deleted_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_timestamp_idx" ON "activity_logs"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "activity_logs_action_timestamp_idx" ON "activity_logs"("action", "timestamp");

-- CreateIndex
CREATE INDEX "activity_logs_route_idx" ON "activity_logs"("route");

-- CreateIndex
CREATE INDEX "activity_logs_user_role_idx" ON "activity_logs"("user_role");

-- CreateIndex
CREATE INDEX "blogs_author_id_idx" ON "blogs"("author_id");

-- CreateIndex
CREATE INDEX "blogs_created_at_idx" ON "blogs"("created_at");

-- CreateIndex
CREATE INDEX "blogs_deleted_at_idx" ON "blogs"("deleted_at");

-- CreateIndex
CREATE INDEX "blogs_author_id_created_at_idx" ON "blogs"("author_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "points_rules_action_key" ON "points_rules"("action");

-- CreateIndex
CREATE INDEX "points_rules_deleted_at_idx" ON "points_rules"("deleted_at");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_identifier_idx" ON "verification_tokens"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
