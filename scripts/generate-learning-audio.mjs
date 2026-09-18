#!/usr/bin/env node
/**
 * Generate mp3 clips for kids learning games (Digraphs + Vowel Words).
 * Uses Microsoft Edge neural TTS via node-edge-tts. Speech synthesis remains fallback if files are missing.
 *
 * Usage:
 *   node scripts/generate-learning-audio.mjs digraphs
 *   node scripts/generate-learning-audio.mjs vowel-words
 *   node scripts/generate-learning-audio.mjs letter-sounds
 *   node scripts/generate-learning-audio.mjs blend-the-word
 *   node scripts/generate-learning-audio.mjs all
 *   node scripts/generate-learning-audio.mjs digraphs --force
 */

import { readFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { EdgeTTS } from 'node-edge-tts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const FORCE = process.argv.includes('--force')
const TARGET = process.argv.slice(2).find((a) => !a.startsWith('-')) ?? 'digraphs'

/** Warm, clear voice suited to early readers. */
const VOICE = 'en-US-AnaNeural'

const tts = new EdgeTTS({
  voice: VOICE,
  lang: 'en-US',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
})

/** Slower so English learners can hear the word, then copy the sound. */
const slowTts = new EdgeTTS({
  voice: VOICE,
  lang: 'en-US',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
  rate: '-20%',
})

async function synth(text, outPath, voice = tts) {
  if (!text?.trim()) return 'empty'
  if (!FORCE && existsSync(outPath)) return 'skip'
  mkdirSync(path.dirname(outPath), { recursive: true })
  await voice.ttsPromise(text.trim(), outPath)
  return 'ok'
}

function audioPath(baseDir, jsonPath) {
  const rel = jsonPath.replace(/^\//, '')
  return path.join(baseDir, rel)
}

async function generateDigraphs() {
  const baseDir = path.join(ROOT, 'public', 'digraphs')
  const digraphs = JSON.parse(readFileSync(path.join(ROOT, 'data/digraphs/digraphs.json'), 'utf8'))
  const words = JSON.parse(readFileSync(path.join(ROOT, 'data/digraphs/words.json'), 'utf8'))

  let ok = 0
  let skip = 0

  for (const d of digraphs) {
    for (const [key, text] of [
      ['phoneme', d.speak.phoneme],
      ['question', d.speak.question],
      ['error', 'Try again'],
    ]) {
      const rel = `/audio/${key}/${d.id}.mp3`
      const result = await synth(text, audioPath(baseDir, rel))
      if (result === 'ok') ok++
      else if (result === 'skip') skip++
      console.log(`[digraphs] ${d.id} ${key}: ${result}`)
    }
  }

  for (const [digraphId, list] of Object.entries(words)) {
    for (const w of list) {
      for (const [key, text] of [
        ['word', w.speakWord],
        ['success', `Great! ${w.speakWord}`],
      ]) {
        const rel = `/audio/${key}/${digraphId}/${w.slug}.mp3`
        const result = await synth(text, audioPath(baseDir, rel))
        if (result === 'ok') ok++
        else if (result === 'skip') skip++
        console.log(`[digraphs] ${digraphId}/${w.slug} ${key}: ${result}`)
      }
    }
  }

  console.log(`Digraphs audio done: ${ok} created, ${skip} skipped`)
}

async function generateVowelWords() {
  const baseDir = path.join(ROOT, 'public', 'vowel-words')
  const vowels = JSON.parse(readFileSync(path.join(ROOT, 'data/vowel-words/vowels.json'), 'utf8'))
  const words = JSON.parse(readFileSync(path.join(ROOT, 'data/vowel-words/words.json'), 'utf8'))

  let ok = 0
  let skip = 0

  for (const v of vowels) {
    for (const [key, text] of [
      ['phoneme', v.speak.phoneme],
      ['question', v.speak.question],
      ['error', 'Try again'],
    ]) {
      const rel = `/audio/${key}/${v.id}.mp3`
      const result = await synth(text, audioPath(baseDir, rel))
      if (result === 'ok') ok++
      else if (result === 'skip') skip++
      console.log(`[vowel-words] ${v.id} ${key}: ${result}`)
    }
    const welcome = await synth(v.speak.welcome, audioPath(baseDir, v.audio.welcome), slowTts)
    if (welcome === 'ok') ok++
    else if (welcome === 'skip') skip++
    console.log(`[vowel-words] ${v.id} welcome: ${welcome}`)
  }

  const successOpeners = ['Well done', 'Perfect', 'Exactly', 'Yes']

  for (const [vowelId, list] of Object.entries(words)) {
    for (const w of list) {
      for (const [key, text] of [
        ['word', w.speakWord],
        ['success', `Great! ${w.speakWord}`],
      ]) {
        const rel = `/audio/${key}/${vowelId}/${w.slug}.mp3`
        const result = await synth(text, audioPath(baseDir, rel))
        if (result === 'ok') ok++
        else if (result === 'skip') skip++
        console.log(`[vowel-words] ${vowelId}/${w.slug} ${key}: ${result}`)
      }

      const learn = await synth(w.speak.learn, audioPath(baseDir, w.audio.learn), slowTts)
      if (learn === 'ok') ok++
      else if (learn === 'skip') skip++
      console.log(`[vowel-words] ${vowelId}/${w.slug} learn: ${learn}`)

      const quiz = await synth(w.speak.quiz, audioPath(baseDir, w.audio.quiz), slowTts)
      if (quiz === 'ok') ok++
      else if (quiz === 'skip') skip++
      console.log(`[vowel-words] ${vowelId}/${w.slug} quiz: ${quiz}`)

      for (let i = 0; i < successOpeners.length; i++) {
        const text = w.speak.success[i] ?? `${successOpeners[i]}. This is the ${w.word}.`
        const result = await synth(text, audioPath(baseDir, w.audio.successes[i]), slowTts)
        if (result === 'ok') ok++
        else if (result === 'skip') skip++
        console.log(`[vowel-words] ${vowelId}/${w.slug} success ${i}: ${result}`)
      }
    }
  }

  console.log(`Vowel Words audio done: ${ok} created, ${skip} skipped`)
}

async function generateLetterSounds() {
  const baseDir = path.join(ROOT, 'public', 'letter-sounds')
  const letters = JSON.parse(readFileSync(path.join(ROOT, 'data/letter-sounds/letters.json'), 'utf8'))

  let ok = 0
  let skip = 0

  for (const letter of letters) {
    for (const [key, text] of [
      ['keyword', letter.speak.keyword],
      ['sound', letter.speak.sound],
    ]) {
      const rel = `/audio/${key}/${letter.id}.mp3`
      const result = await synth(text, audioPath(baseDir, rel), slowTts)
      if (result === 'ok') ok++
      else if (result === 'skip') skip++
      console.log(`[letter-sounds] ${letter.id} ${key}: ${result}`)
    }
  }

  for (const [name, text] of [
    ['question.mp3', 'Listen. Which letter?'],
    ['success.mp3', 'Great!'],
    ['error.mp3', 'Try again. Listen once more.'],
  ]) {
    const result = await synth(text, path.join(baseDir, 'audio', name), slowTts)
    if (result === 'ok') ok++
    else if (result === 'skip') skip++
    console.log(`[letter-sounds] ${name}: ${result}`)
  }

  console.log(`Letter sounds audio done: ${ok} created, ${skip} skipped`)
}

async function generateBlendWord() {
  const baseDir = path.join(ROOT, 'public', 'blend-the-word')
  const words = JSON.parse(readFileSync(path.join(ROOT, 'data/blend-the-word/words.json'), 'utf8'))

  let ok = 0
  let skip = 0

  for (const word of words) {
    const rel = word.audio.sounds
    const result = await synth(word.speak.sounds, audioPath(baseDir, rel), slowTts)
    if (result === 'ok') ok++
    else if (result === 'skip') skip++
    console.log(`[blend-the-word] ${word.id} sounds: ${result}`)
  }

  for (const [name, text] of [
    ['success.mp3', 'Great!'],
    ['error.mp3', 'Try again. Listen once more.'],
  ]) {
    const result = await synth(text, path.join(baseDir, 'audio', name), slowTts)
    if (result === 'ok') ok++
    else if (result === 'skip') skip++
    console.log(`[blend-the-word] ${name}: ${result}`)
  }

  console.log(`Blend the word audio done: ${ok} created, ${skip} skipped`)
}

const run = async () => {
  if (TARGET === 'all') {
    await generateDigraphs()
    await generateVowelWords()
    await generateLetterSounds()
    await generateBlendWord()
  } else if (TARGET === 'digraphs') {
    await generateDigraphs()
  } else if (TARGET === 'vowel-words') {
    await generateVowelWords()
  } else if (TARGET === 'letter-sounds') {
    await generateLetterSounds()
  } else if (TARGET === 'blend-the-word') {
    await generateBlendWord()
  } else {
    console.error(
      'Usage: node scripts/generate-learning-audio.mjs [digraphs|vowel-words|letter-sounds|blend-the-word|all] [--force]'
    )
    process.exit(1)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
