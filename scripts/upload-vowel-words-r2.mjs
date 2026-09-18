#!/usr/bin/env node
/**
 * Upload public/vowel-words/** to Cloudflare R2 (default: monalomedia/vowel-words/).
 *
 * Usage:
 *   node scripts/upload-vowel-words-r2.mjs
 *   node scripts/upload-vowel-words-r2.mjs --force
 */

import { createReadStream, readFileSync } from 'fs'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const LOCAL_DIR = path.join(ROOT, 'public', 'vowel-words')
const R2_PREFIX = process.env.VOWEL_WORDS_R2_PREFIX || 'vowel-words'
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
    // ignore
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
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.md': 'text/markdown',
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
  const bucket =
    process.env.VOWEL_WORDS_R2_BUCKET || process.env.R2_BUCKET_NAME || 'monalomedia'

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error(
      'Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env'
    )
    process.exit(1)
  }

  try {
    await stat(LOCAL_DIR)
  } catch {
    console.error(`Local assets not found: ${LOCAL_DIR}`)
    process.exit(1)
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })

  const files = await walk(LOCAL_DIR)
  console.log(`Uploading ${files.length} files to s3://${bucket}/${R2_PREFIX}/ ...`)

  let uploaded = 0
  let skipped = 0

  for (const { rel, full } of files) {
    const key = `${R2_PREFIX}/${rel}`
    if (!FORCE) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
        skipped += 1
        continue
      } catch {
        // upload
      }
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: createReadStream(full),
        ContentType: contentType(full),
        CacheControl: 'public, max-age=31536000, immutable',
      })
    )
    uploaded += 1
    console.log(`  ok ${key}`)
  }

  console.log(`Done. uploaded=${uploaded} skipped=${skipped}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
