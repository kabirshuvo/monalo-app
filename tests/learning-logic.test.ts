import { describe, expect, it } from 'vitest'
import { isGuestTryPath } from '@/lib/learning/guest-try'
import {
  computePhonicsProgress,
  isGroupComplete,
  isPhonicsGroupId,
  PHONICS_GROUP_LETTER_IDS,
} from '@/lib/learning/phonics-progress'
import { validateEmail } from '@/lib/validators'

describe('isGuestTryPath', () => {
  it('allows the hub and the two guest rooms', () => {
    expect(isGuestTryPath('/learning')).toBe(true)
    expect(isGuestTryPath('/learning/nursery-rhyme')).toBe(true)
    expect(isGuestTryPath('/learning/letter-sounds')).toBe(true)
    expect(isGuestTryPath('/learning/letter-sounds/quiz')).toBe(true)
  })
  it('requires login for every other room', () => {
    expect(isGuestTryPath('/learning/digraphs')).toBe(false)
    expect(isGuestTryPath('/learning/nursery-rhyme/extra')).toBe(false)
    expect(isGuestTryPath('/dashboard')).toBe(false)
  })
})

describe('phonics progress', () => {
  it('starts with only the first group unlocked', () => {
    const p = computePhonicsProgress([])
    expect(p.unlockedGroupIds).toEqual(['satpin'])
    expect(p.completedGroupIds).toEqual([])
    expect(p.activeGroupId).toBe('satpin')
  })

  it('unlocks the next group once every letter in the previous one is mastered', () => {
    const first = PHONICS_GROUP_LETTER_IDS.satpin
    const partial = computePhonicsProgress(first.slice(1))
    expect(partial.unlockedGroupIds).toHaveLength(1)

    const done = computePhonicsProgress(first)
    expect(done.completedGroupIds).toContain('satpin')
    expect(done.unlockedGroupIds.length).toBeGreaterThan(1)
    expect(isGroupComplete('satpin', new Set(first))).toBe(true)
  })

  it('validates group ids', () => {
    expect(isPhonicsGroupId('satpin')).toBe(true)
    expect(isPhonicsGroupId('nope')).toBe(false)
  })
})

describe('validateEmail', () => {
  it('accepts normal addresses and rejects malformed ones', () => {
    expect(validateEmail('a@b.co')).toBe(true)
    expect(validateEmail('a@b')).toBe(false)
    expect(validateEmail('a b@c.com')).toBe(false)
    expect(validateEmail(`${'a'.repeat(260)}@b.co`)).toBe(false)
  })
})
