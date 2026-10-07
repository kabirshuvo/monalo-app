/**
 * Eco Penguin product scope — Stage 1 ESL program.
 *
 * We map rooms to Cambridge Early Years → Primary Stage 1 ESL *goals*
 * (listening, phonics, sight reading, early speaking/writing). We do **not**
 * claim Cambridge certification or ship a licensed Cambridge course.
 *
 * Pillars: phonics spine (SATPIN…) · reading (sight + stories) · listening
 * · speaking (listen-and-repeat) · early writing (tiles/trace) · parent progress.
 *
 * Out of scope: grammar drills, chatbots, arcade hub bloat, commercial letter-order swaps.
 */

/** Correct answers needed before a item counts as mastered / awards points. */
export const ECO_PENGUIN_MASTERY_HITS = 2

export const ECO_PENGUIN_PROGRAM = {
  name: 'Eco Penguin',
  positioning: 'Stage 1 ESL program',
  claim:
    'Mapped to Cambridge Early Years / Primary Stage 1 ESL goals — not Cambridge certified.',
  audience: 'Nursery → Class 1 ESL learners (approx. ages 3–7)',
} as const

/** Cambridge Early Years / Primary Stage 1 ESL framing for Eco Penguin rooms. */

export type CambridgeEslStageId =
  | 'nursery'
  | 'speaking'
  | 'letters'
  | 'vocabulary'
  | 'stage1-phonics'
  | 'stage1-read'
  | 'stage1-write'

export type CambridgeEslStage = {
  id: CambridgeEslStageId
  /** Short chip on hub cards */
  chip: string
  /** Parent-facing line */
  parent: string
}

export const CAMBRIDGE_ESL_STAGES: Record<CambridgeEslStageId, CambridgeEslStage> = {
  nursery: {
    id: 'nursery',
    chip: 'Nursery · listen & rhyme',
    parent: 'Cambridge Early Years ESL — listening, rhyme, and oral vocabulary',
  },
  speaking: {
    id: 'speaking',
    chip: 'Nursery–S1 · speaking',
    parent: 'Cambridge Early Years → Stage 1 ESL — listen and repeat (oral practice)',
  },
  letters: {
    id: 'letters',
    chip: 'Letters & sounds · EY–S1',
    parent: 'Cambridge Early Years → Stage 1 — letter sounds and phonics foundations',
  },
  vocabulary: {
    id: 'vocabulary',
    chip: 'Nursery–S1 · vocabulary',
    parent: 'Cambridge Early Years → Stage 1 ESL — picture vocabulary and listening',
  },
  'stage1-phonics': {
    id: 'stage1-phonics',
    chip: 'Stage 1 · phonics',
    parent: 'Cambridge Primary Stage 1 ESL — blend, segment, digraphs, and spelling',
  },
  'stage1-read': {
    id: 'stage1-read',
    chip: 'Stage 1 · reading',
    parent: 'Cambridge Primary Stage 1 ESL — sight words and decodable reading',
  },
  'stage1-write': {
    id: 'stage1-write',
    chip: 'Stage 1 · writing',
    parent: 'Cambridge Primary Stage 1 ESL — early writing: letters and short sentences',
  },
}

/** Hub card chip overrides when a room needs a more specific label than its stage. */
export const CAMBRIDGE_ROOM_CHIPS: Partial<Record<string, string>> = {
  'sight-words': 'Stage 1 · sight words',
  'consonant-blends': 'Stage 1 · consonant blends',
  'say-it': 'Nursery–S1 · speaking',
  'write-it': 'Stage 1 · writing',
}
