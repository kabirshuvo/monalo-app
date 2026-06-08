#!/usr/bin/env node
/**
 * Run Prisma seed with .env loaded and ts-node (tsx is not a project dependency).
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

const seedUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL

if (!seedUrl) {
  console.error(
    'Missing database URL. Add DATABASE_URL_UNPOOLED to .env (direct Neon URL).\n' +
      'See docs/DATABASE_SETUP.md'
  )
  process.exit(1)
}

if (
  seedUrl.startsWith('prisma://') ||
  seedUrl.startsWith('prisma+postgres://')
) {
  console.error(
    'Seed requires a direct postgresql:// URL (DATABASE_URL_UNPOOLED), not Prisma Accelerate.'
  )
  process.exit(1)
}

const env = {
  ...process.env,
  DATABASE_URL: seedUrl,
  DATABASE_URL_UNPOOLED: seedUrl,
}

console.log(`==> prisma db seed (${seedUrl.replace(/\/\/.*@/, '//***@')})`)

execSync(
  'npx ts-node --compiler-options \'{"module":"CommonJS","moduleResolution":"node"}\' prisma/seed.ts',
  { stdio: 'inherit', env }
)
