#!/usr/bin/env bash
# Reset Neon database and apply all Prisma migrations from scratch.
# WARNING: Deletes ALL data in the public schema.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env — copy from .dev.vars.example and add DATABASE_URL"
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

# Neon: use unpooled connection for DDL/migrations
MIGRATE_URL="${DATABASE_URL_UNPOOLED:-${POSTGRES_URL_NON_POOLING:-$DATABASE_URL}}"

if [ -z "$MIGRATE_URL" ]; then
  echo "Set DATABASE_URL or DATABASE_URL_UNPOOLED in .env"
  exit 1
fi

echo "==> Using migrate URL (unpooled): ${MIGRATE_URL%%@*}@***"

echo "==> Clear failed migration marker (if any)"
npx prisma migrate resolve --rolled-back "20260114175449_monalo" 2>/dev/null || true

echo "==> Drop and recreate public schema"
printf '%s\n' \
  'DROP SCHEMA IF EXISTS public CASCADE;' \
  'CREATE SCHEMA public;' \
  'GRANT ALL ON SCHEMA public TO public;' \
  | npx prisma db execute --url "$MIGRATE_URL" --stdin

echo "==> Apply all migrations"
DATABASE_URL="$MIGRATE_URL" npx prisma migrate deploy

echo "==> Generate Prisma client"
npx prisma generate

echo "==> Seed database"
npx prisma db seed

echo ""
echo "Done. Test logins (password: Test@1234):"
echo "  admin@monalo.test"
echo "  seller@monalo.test"
echo "  customer@monalo.test"
