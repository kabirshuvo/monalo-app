import type { LearningGameId } from '@/lib/learning/kids-hub'

export type RoomLock = {
  /** Sticker group that must be completed first. */
  needs: 'satpin' | 'mdgock'
  /** Eco guide line id (data/eco-guide/lines.json). */
  lineId: 'locked-satpin' | 'locked-mdgock'
  /** Short text for the room tile and the speech bubble. */
  message: string
}

const SATPIN: RoomLock = {
  needs: 'satpin',
  lineId: 'locked-satpin',
  message:
    'This room is sleeping. Catch all the S, A, T, P, I, N balloons to win your star sticker, and Eco will wake it up!',
}

const MDGOCK: RoomLock = {
  needs: 'mdgock',
  lineId: 'locked-mdgock',
  message:
    'This room is sleeping. Catch the M, D, G, O, C, K balloons to win your moon sticker, and Eco will wake it up!',
}

/** Mirrors the gates inside each room (sticker groups from Balloon letters). */
const LOCKS: Partial<Record<LearningGameId, RoomLock>> = {
  'blend-the-word': SATPIN,
  'segment-the-word': SATPIN,
  'sight-words': SATPIN,
  'write-it': SATPIN,
  'read-a-story': SATPIN,
  'consonant-blends': MDGOCK,
}

/** Returns the lock for a room, or null when the room is open to this learner. */
export function getRoomLock(id: LearningGameId, completedGroupIds: readonly string[]): RoomLock | null {
  const lock = LOCKS[id]
  if (!lock) return null
  return completedGroupIds.includes(lock.needs) ? null : lock
}
