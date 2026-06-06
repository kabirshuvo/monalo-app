#!/usr/bin/env node
/**
 * Upload public/ecopenguin/** to Cloudflare R2 (default: monalomedia/eco-penguine/).
 *
 * Requires in .env or environment:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
 *   ECO_PENGUIN_R2_BUCKET (default: monalomedia)
 *   ECO_PENGUIN_R2_PREFIX (default: eco-penguine)
 *
 * Usage:
 *   node scripts/upload-ecopenguin-r2.mjs
 *   node scripts/upload-ecopenguin-r2.mjs --force   # re-upload all objects
 */

import { createReadStream, readFileSync } from 'fs'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const LOCAL_DIR = path.join(ROOT, 'public', 'ecopenguin')
const R2_PREFIX = process.env.ECO_PENGUIN_R2_PREFIX || 'eco-penguine'
const FORCE = process.argv.includes('--force')

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
    // ignore missing file
  }
}

loadEnvFile(path.join(ROOT, '.env'))
loadEnvFile(path.join(ROOT, '.env.local'))

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const map = {
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
  }
  return map[ext] || 'application/octet-stream'
}

async function walk(dir, relBase = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full, rel)))
    } else {
      files.push({ rel, full })
    }
  }
  return files
}

async function main() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.ECO_PENGUIN_R2_BUCKET || process.env.R2_BUCKET_NAME || 'monalomedia'

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error('Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env')
    process.exit(1)
  }

  try {
    await stat(LOCAL_DIR)
  } catch {
    console.error(`Local assets not found: ${LOCAL_DIR}`)
    console.error('Run from monalo-app after copying this-is-app public assets to public/ecopenguin/')
    process.exit(1)
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })

  const files = await walk(LOCAL_DIR)
  const dest = R2_PREFIX ? `${bucket}/${R2_PREFIX}/` : `${bucket}/`
  console.log(`Uploading ${files.length} files to s3://${dest} ...`)

  let uploaded = 0
  let skipped = 0

  for (const { rel, full } of files) {
    const key = R2_PREFIX ? `${R2_PREFIX}/${rel}` : rel
    if (!FORCE) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
        skipped += 1
        continue
      } catch {
        // not found — upload
      }
    }

    const body = createReadStream(full)
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType(full),
        CacheControl: 'public, max-age=31536000, immutable',
      })
    )
    uploaded += 1
    if (uploaded % 50 === 0) {
      console.log(`  … ${uploaded} uploaded`)
    }
  }

  console.log(`Done. uploaded=${uploaded} skipped=${skipped} (existing)`)
  const publicBase = (
    process.env.NEXT_PUBLIC_ECO_PENGUIN_MEDIA_BASE_URL ||
    process.env.R2_PUBLIC_BASE_URL ||
    ''
  ).replace(/\/$/, '')
  const examplePath = R2_PREFIX ? `${R2_PREFIX}/images/categories/animals.webp` : 'images/categories/animals.webp'
  if (publicBase) {
    console.log(`Public example: ${publicBase}/${examplePath}`)
  } else {
    console.log('Set NEXT_PUBLIC_ECO_PENGUIN_MEDIA_BASE_URL to your bucket public URL (e.g. https://pub-xxxx.r2.dev).')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
