import { ECO_PENGUIN_MASTERY_HITS } from '@/lib/learning/cambridge-esl'
import { readActiveLearnerIdClient } from '@/lib/classroom/client'

const STORAGE_PREFIX = 'ecopenguin:mastery-hits:'

function key(room: string, itemId: string): string {
  const learner = readActiveLearnerIdClient()
  const scope = learner ? `lp:${learner}:` : ''
  return `${STORAGE_PREFIX}${scope}${room}:${itemId}`
}

function readHits(room: string, itemId: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = window.localStorage.getItem(key(room, itemId))
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

function writeHits(room: string, itemId: string, hits: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key(room, itemId), String(hits))
  } catch {
    // ignore
  }
}

/**
 * Record a correct answer. Returns whether this item just crossed the mastery
 * threshold (so the client should call celebrate / award points).
 */
export function recordMasteryHit(
  room: string,
  itemId: string,
  requiredHits = ECO_PENGUIN_MASTERY_HITS
): { hits: number; justMastered: boolean; alreadyMastered: boolean } {
  const prev = readHits(room, itemId)
  if (prev >= requiredHits) {
    return { hits: prev, justMastered: false, alreadyMastered: true }
  }
  const hits = prev + 1
  writeHits(room, itemId, hits)
  return {
    hits,
    justMastered: hits >= requiredHits,
    alreadyMastered: false,
  }
}

export function getMasteryHits(room: string, itemId: string): number {
  return readHits(room, itemId)
}

export function isLocallyMastered(
  room: string,
  itemId: string,
  requiredHits = ECO_PENGUIN_MASTERY_HITS
): boolean {
  return readHits(room, itemId) >= requiredHits
}
