#!/usr/bin/env node
/** Print direct Postgres URL for migrations/reset (loads .env safely). */
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

const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL

if (!url) {
  console.error('Missing DATABASE_URL_UNPOOLED in .env')
  process.exit(1)
}

if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
  console.error('Use direct postgresql:// URL, not Prisma Accelerate')
  process.exit(1)
}

process.stdout.write(url)
