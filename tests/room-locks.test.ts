import { describe, expect, it } from 'vitest'
import { getRoomLock } from '@/lib/learning/room-locks'
import lines from '@/data/eco-guide/lines.json'

describe('getRoomLock', () => {
  it('leaves the first rooms open for everyone', () => {
    for (const id of ['nursery-rhyme', 'say-it', 'letter-sounds', 'balloon-letters'] as const) {
      expect(getRoomLock(id, [])).toBeNull()
    }
  })

  it('locks sticker-gated rooms until the SATPIN sticker is earned', () => {
    for (const id of ['blend-the-word', 'sight-words', 'write-it', 'read-a-story'] as const) {
      expect(getRoomLock(id, [])?.needs).toBe('satpin')
      expect(getRoomLock(id, ['satpin'])).toBeNull()
    }
  })

  it('needs the MDGOCK sticker for consonant blends', () => {
    expect(getRoomLock('consonant-blends', ['satpin'])?.needs).toBe('mdgock')
    expect(getRoomLock('consonant-blends', ['satpin', 'mdgock'])).toBeNull()
  })

  it('points every lock at a real spoken guide line', () => {
    const l = lines as Record<string, string>
    for (const id of ['blend-the-word', 'consonant-blends'] as const) {
      const lock = getRoomLock(id, [])!
      expect(l[lock.lineId]).toBeTruthy()
    }
  })
})

describe('eco guide lines', () => {
  it('has a next-room line for every learning game', () => {
    const l = lines as Record<string, string>
    for (const id of [
      'nursery-rhyme', 'say-it', 'letter-sounds', 'which-sound', 'balloon-letters',
      'blend-the-word', 'segment-the-word', 'sight-words', 'write-it', 'ecopenguin',
      'vowel-words', 'digraphs', 'consonant-blends', 'build-the-word', 'read-a-story',
    ]) {
      expect(l[`next-${id}`], id).toBeTruthy()
    }
  })
})
