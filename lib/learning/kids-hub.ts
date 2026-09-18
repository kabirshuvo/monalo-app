export const LEARNING_HUB_PATH = '/learning'
/** Brand name for the kids learning app (umbrella over all rooms). */
export const ECO_PENGUIN_APP_NAME = 'Eco Penguin'

export type LearningGameId =
  | 'letter-sounds'
  | 'balloon-letters'
  | 'blend-the-word'
  | 'ecopenguin'
  | 'vowel-words'
  | 'digraphs'
  | 'build-the-word'

export type LearningGameCard = {
  id: LearningGameId
  title: string
  blurb: string
  href: string
  accent: string
  badge: string
  live: boolean
  /** Soft path order 1–7 on the hub. */
  step: number
}
