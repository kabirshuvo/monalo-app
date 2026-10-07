export const LEARNING_HUB_PATH = '/learning'
/** Brand name for the kids learning app (umbrella over all rooms). */
export const ECO_PENGUIN_APP_NAME = 'Eco Penguin'

export type LearningGameId =
  | 'nursery-rhyme'
  | 'say-it'
  | 'letter-sounds'
  | 'which-sound'
  | 'balloon-letters'
  | 'blend-the-word'
  | 'segment-the-word'
  | 'sight-words'
  | 'ecopenguin'
  | 'vowel-words'
  | 'digraphs'
  | 'consonant-blends'
  | 'build-the-word'
  | 'write-it'
  | 'read-a-story'

export type LearningGameCard = {
  id: LearningGameId
  title: string
  blurb: string
  href: string
  accent: string
  badge: string
  live: boolean
  /** Soft path order on the hub. */
  step: number
  /** Cambridge ESL stage chip for parents/teachers */
  cambridgeChip: string
}
