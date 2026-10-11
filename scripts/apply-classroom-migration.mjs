#!/usr/bin/env node
/**
 * Apply ONLY prisma/migrations/20260919T032500_classroom_mode to the production database.
 *
 * Why this exists: production has no _prisma_migrations table (Prisma error P3005), so
 * `npm run db:migrate:production` refuses to run. This applies the one missing migration
 * file directly, in a single transaction. The SQL is idempotent (IF NOT EXISTS), so it is
 * safe to re-run.
 *
 * Usage (reads PRODUCTION_DATABASE_URL from the environment or .env):
 *   set -a && . ./.env && set +a && node scripts/apply-classroom-migration.mjs
 */
import { readFileSync } from 'node:fs'
import pg from 'pg'

const url = process.env.PRODUCTION_DATABASE_URL
if (!url) {
  console.error('Set PRODUCTION_DATABASE_URL (see .env).')
  process.exit(1)
}

const sql = readFileSync(
  new URL('../prisma/migrations/20260919T032500_classroom_mode/migration.sql', import.meta.url),
  'utf8'
)

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
await client.connect()

const has = async (query, params) => (await client.query(query, params)).rowCount > 0

try {
  await client.query('BEGIN')
  await client.query(sql)
  await client.query('COMMIT')
  console.log('Applied classroom_mode migration.')
} catch (error) {
  await client.query('ROLLBACK')
  console.error('FAILED, rolled back:', error.message)
  await client.end()
  process.exit(1)
}

const checks = {
  'classrooms table': await has('select 1 from information_schema.tables where table_name=$1', ['classrooms']),
  'learner_profiles table': await has('select 1 from information_schema.tables where table_name=$1', ['learner_profiles']),
  'point_events.learner_profile_id': await has(
    'select 1 from information_schema.columns where table_name=$1 and column_name=$2',
    ['point_events', 'learner_profile_id']
  ),
  'Role has TEACHER': await has(
    'select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname=$1 and e.enumlabel=$2',
    ['Role', 'TEACHER']
  ),
}
for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? 'OK  ' : 'MISSING'} ${name}`)
await client.end()
