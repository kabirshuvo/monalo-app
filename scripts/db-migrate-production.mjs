#!/usr/bin/env node
/**
 * Apply Prisma migrations to the production database (direct Postgres URL).
 *
 * Usage:
 *   PRODUCTION_DATABASE_URL='postgresql://...@db.prisma.io/...' npm run db:migrate:production
 */
import { execSync } from 'node:child_process'

const url = process.env.PRODUCTION_DATABASE_URL

if (!url) {
  console.error(
    'Set PRODUCTION_DATABASE_URL to the direct Postgres URL from console.prisma.io\n' +
      '(not the Accelerate prisma+postgres:// URL)'
  )
  process.exit(1)
}

if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
  console.error('Use direct postgresql:// for migrations, not Accelerate.')
  process.exit(1)
}

const env = {
  ...process.env,
  DATABASE_URL: url,
  DATABASE_URL_UNPOOLED: url,
}

console.log(`==> migrate deploy production (${url.replace(/\/\/.*@/, '//***@')})`)
execSync('npx prisma migrate deploy', { stdio: 'inherit', env })
