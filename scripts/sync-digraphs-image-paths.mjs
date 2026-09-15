#!/usr/bin/env node
/**
 * Point digraph JSON image paths at .webp when the webp file exists in public/digraphs.
 *
 * Usage:
 *   node scripts/sync-digraphs-image-paths.mjs
 *   node scripts/sync-digraphs-image-paths.mjs --write
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const WRITE = process.argv.includes('--write')
const PUBLIC = path.join(ROOT, 'public', 'digraphs')

function preferWebp(imagePath) {
  if (!imagePath.endsWith('.svg')) return imagePath
  const webpPath = imagePath.replace(/\.svg$/, '.webp')
  const disk = path.join(PUBLIC, webpPath.replace(/^\//, ''))
  return existsSync(disk) ? webpPath : imagePath
}

function syncFile(jsonRel) {
  const full = path.join(ROOT, jsonRel)
  const data = JSON.parse(readFileSync(full, 'utf8'))
  let changes = 0

  const touch = (obj) => {
    if (Array.isArray(obj)) {
      obj.forEach(touch)
      return
    }
    if (!obj || typeof obj !== 'object') return
    if (typeof obj.image === 'string') {
      const next = preferWebp(obj.image)
      if (next !== obj.image) {
        console.log(`${jsonRel}: ${obj.image} -> ${next}`)
        obj.image = next
        changes++
      }
    }
    Object.values(obj).forEach(touch)
  }

  touch(data)
  if (WRITE && changes > 0) {
    writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  }
  return changes
}

const total = syncFile('data/digraphs/digraphs.json') + syncFile('data/digraphs/words.json')
console.log(`${total} path(s) ${WRITE ? 'updated' : 'would update'} (run with --write to save)`)
