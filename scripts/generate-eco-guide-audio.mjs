#!/usr/bin/env node
/**
 * Generate Eco the penguin's spoken guide lines (data/eco-guide/lines.json).
 * Voice: en-US-AnaNeural, slightly slower and higher so it sounds friendly to small children.
 * Output: public/eco-guide/audio/<id>.mp3
 *
 * Usage:
 *   node scripts/generate-eco-guide-audio.mjs          # only missing clips
 *   node scripts/generate-eco-guide-audio.mjs --force  # regenerate all
 */
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EdgeTTS } from 'node-edge-tts'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORCE = process.argv.includes('--force')
const OUT_DIR = path.join(ROOT, 'public', 'eco-guide', 'audio')
const lines = JSON.parse(readFileSync(path.join(ROOT, 'data/eco-guide/lines.json'), 'utf8'))

const tts = new EdgeTTS({
  voice: 'en-US-AnaNeural',
  lang: 'en-US',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
  rate: '-8%',
  pitch: '+8%',
})

mkdirSync(OUT_DIR, { recursive: true })
let ok = 0
let skipped = 0
for (const [id, text] of Object.entries(lines)) {
  const out = path.join(OUT_DIR, `${id}.mp3`)
  if (!FORCE && existsSync(out)) {
    skipped++
    continue
  }
  await tts.ttsPromise(text, out)
  ok++
  console.log('ok', id)
}
console.log(`done: ${ok} generated, ${skipped} skipped`)
