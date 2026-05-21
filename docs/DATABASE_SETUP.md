# Database setup (Neon + Prisma)

## What went wrong

Your Neon database had a **mixed schema**:

- Old tables: `User`, `Course`, `Product` (PascalCase)
- New migrations expect: `users`, `courses`, `orders`, etc.
- Migration `20260114175449_monalo` failed with `OrderStatus already exists`
- `prisma db push` cannot fix this safely (would drop old tables and still miss `orders`)

**Do not use `prisma db push` on this project** — use migrations only.

## Fix (recommended): reset + migrate

This wipes the database and reapplies all migrations. Fine for dev / empty production.

```bash
chmod +x scripts/db-reset.sh
./scripts/db-reset.sh
```

Or step by step:

```bash
# 1. Unblock failed migration
npx prisma migrate resolve --rolled-back "20260114175449_monalo"

# 2. Reset schema (use UNPOOLED URL on Neon)
echo 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;' \
  | npx prisma db execute --url "$DATABASE_URL_UNPOOLED" --stdin

# 3. Apply migrations (unpooled recommended)
DATABASE_URL="$DATABASE_URL_UNPOOLED" npx prisma migrate deploy

# 4. Regenerate client (fixes seed errors: artistProfile, artwork)
npx prisma generate

# 5. Seed
npx prisma db seed
```

## Environment

In `.env`:

```env
DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...without-pooler.../neondb?sslmode=require
```

`prisma/schema.prisma` uses `directUrl` for migrations when `DATABASE_URL_UNPOOLED` is set.

## After setup

```bash
npm run dev
```

## If you must keep existing data

You need a manual SQL migration from old `User`/`Course` tables to new `users`/`courses`. That is not automated — contact support or export data first, then run `./scripts/db-reset.sh`.
