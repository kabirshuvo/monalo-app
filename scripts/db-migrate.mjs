#!/usr/bin/env node
/**
 * Apply Prisma migrations using a direct (unpooled) Postgres URL.
 * Loads .env / .env.local and prefers DATABASE_URL_UNPOOLED for DDL.
 */
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

function loadEnvFile(relativePath) {
  const file = path.resolve(process.cwd(), relativePath)
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile('.env')
loadEnvFile('.env.local')

const migrateUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL

if (!migrateUrl) {
  console.error(
    'Missing database URL. Add to .env:\n' +
      '  DATABASE_URL_UNPOOLED=postgresql://USER:PASSWORD@HOST/DB?sslmode=require\n' +
      '(Direct Neon URL — not the Prisma Accelerate URL. See docs/PRISMA_ACCELERATE.md)'
  )
  process.exit(1)
}

if (
  migrateUrl.startsWith('prisma://') ||
  migrateUrl.startsWith('prisma+postgres://')
) {
  console.error(
    'Migrations require a direct postgresql:// URL (DATABASE_URL_UNPOOLED).\n' +
      'Prisma Accelerate URLs cannot run migrations. See docs/PRISMA_ACCELERATE.md'
  )
  process.exit(1)
}

const env = {
  ...process.env,
  DATABASE_URL: migrateUrl,
  DATABASE_URL_UNPOOLED: migrateUrl,
}

console.log(`==> migrate deploy (${migrateUrl.replace(/\/\/.*@/, '//***@')})`)

execSync('npx prisma migrate deploy', { stdio: 'inherit', env })
