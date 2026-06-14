#!/usr/bin/env node
/**
 * Promote a user to ADMIN on the production database.
 *
 * Requires the **direct** Postgres URL from console.prisma.io (not the Accelerate URL).
 *
 * Usage:
 *   PRODUCTION_DATABASE_URL='postgresql://...@db.prisma.io/...' \
 *     node scripts/make-admin-production.mjs you@example.com
 */
import { Client } from 'pg'

const url = process.env.PRODUCTION_DATABASE_URL
const email = process.argv[2]?.trim().toLowerCase()

if (!url || !email) {
  console.error(
    'Usage: PRODUCTION_DATABASE_URL=postgresql://... node scripts/make-admin-production.mjs user@example.com\n\n' +
      'Get the direct URL: console.prisma.io → project monalo → Database → connection string\n' +
      '(Use db.prisma.io or your linked Neon unpooled URL — not prisma+postgres:// Accelerate)'
  )
  process.exit(1)
}

if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
  console.error('PRODUCTION_DATABASE_URL must be direct postgresql://, not Prisma Accelerate.')
  process.exit(1)
}

const client = new Client({ connectionString: url, connectionTimeoutMillis: 20_000 })

try {
  await client.connect()
  const before = await client.query('SELECT email, role FROM users WHERE email = $1', [email])
  if (before.rowCount === 0) {
    console.error(`❌ No user found: ${email}`)
    console.error('   Register and sign in once at https://monalo.school, then run this again.')
    process.exit(1)
  }
  console.log(`Current role: ${before.rows[0].role}`)
  const after = await client.query(
    "UPDATE users SET role = 'ADMIN' WHERE email = $1 RETURNING email, role",
    [email]
  )
  console.log(`✅ ${after.rows[0].email} is now ${after.rows[0].role}`)
} catch (err) {
  console.error('❌ Error:', err instanceof Error ? err.message : err)
  process.exit(1)
} finally {
  await client.end()
}
