#!/usr/bin/env node
/**
 * Copy eco-penguine/** objects from the legacy `ecopenguin` bucket into `monalomedia`
 * so media.monalo.school (custom domain on monalomedia) serves Eco Penguin assets.
 *
 * Requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env
 *
 * Usage:
 *   node scripts/copy-ecopenguin-to-monalomedia.mjs
 *   node scripts/copy-ecopenguin-to-monalomedia.mjs --dry-run
 */

import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SOURCE_BUCKET = process.env.ECO_PENGUIN_SOURCE_BUCKET || 'ecopenguin'
const DEST_BUCKET = process.env.ECO_PENGUIN_R2_BUCKET || process.env.R2_BUCKET_NAME || 'monalomedia'
const PREFIX = process.env.ECO_PENGUIN_R2_PREFIX || 'eco-penguine'
const DRY_RUN = process.argv.includes('--dry-run')

function loadEnvFile(filePath) {
  try {
    const text = readFileSync(filePath, 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // ignore
  }
}

loadEnvFile(path.join(ROOT, '.env'))
loadEnvFile(path.join(ROOT, '.env.local'))

async function main() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error('Missing R2 credentials in .env')
    process.exit(1)
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })

  console.log(`Copying s3://${SOURCE_BUCKET}/${PREFIX}/ → s3://${DEST_BUCKET}/${PREFIX}/`)
  if (DRY_RUN) console.log('(dry run — no writes)')

  let token
  let copied = 0
  let skipped = 0

  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: SOURCE_BUCKET,
        Prefix: `${PREFIX}/`,
        ContinuationToken: token,
      })
    )

    for (const obj of list.Contents ?? []) {
      if (!obj.Key) continue

      if (!DRY_RUN) {
        try {
          await client.send(new HeadObjectCommand({ Bucket: DEST_BUCKET, Key: obj.Key }))
          skipped += 1
          continue
        } catch {
          // not in dest — copy
        }

        await client.send(
          new CopyObjectCommand({
            Bucket: DEST_BUCKET,
            Key: obj.Key,
            CopySource: `${SOURCE_BUCKET}/${encodeURIComponent(obj.Key).replace(/%2F/g, '/')}`,
            MetadataDirective: 'COPY',
          })
        )
      }

      copied += 1
      if (copied % 100 === 0) console.log(`  … ${copied} processed`)
    }

    token = list.IsTruncated ? list.NextContinuationToken : undefined
  } while (token)

  console.log(`Done. copied=${copied} skipped=${skipped}${DRY_RUN ? ' (dry run)' : ''}`)
  const base = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '')
  if (base) {
    console.log(`Verify: ${base}/${PREFIX}/images/categories/animals.webp`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
