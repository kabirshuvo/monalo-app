#!/usr/bin/env node
/**
 * Apply CORS policy to monalomedia bucket (Eco Penguin browser access).
 *
 * Uses Cloudflare API (not S3). Requires:
 *   CLOUDFLARE_API_TOKEN — R2 Edit permission
 *   R2_ACCOUNT_ID (default: 551aa3726dff734e7e9a82fc748927c4)
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=xxx node scripts/configure-ecopenguin-r2-cors.mjs
 */

import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '551aa3726dff734e7e9a82fc748927c4'
const BUCKET = process.env.R2_BUCKET_NAME || 'monalomedia'
const TOKEN = process.env.CLOUDFLARE_API_TOKEN

async function main() {
  if (!TOKEN) {
    console.error('Set CLOUDFLARE_API_TOKEN (R2 Edit on account).')
    process.exit(1)
  }

  const corsPath = path.join(ROOT, 'config', 'ecopenguin-r2-cors.json')
  const body = await readFile(corsPath, 'utf-8')

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/cors`

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  const json = await res.json()
  if (!res.ok || !json.success) {
    console.error('CORS update failed:', JSON.stringify(json, null, 2))
    process.exit(1)
  }

  console.log(`CORS policy applied to bucket "${BUCKET}" (account ${ACCOUNT_ID}).`)
  console.log('Origins:', JSON.parse(body).rules[0].allowed.origins.join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
