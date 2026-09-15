export const LEARNING_HUB_PATH = '/learning'
/** Brand name for the kids learning app (umbrella over all rooms). */
export const ECO_PENGUIN_APP_NAME = 'Eco Penguin'

export type LearningGameId = 'ecopenguin' | 'vowel-words' | 'digraphs' | 'build-the-word'

export type LearningGameCard = {
  id: LearningGameId
  title: string
  blurb: string
  href: string
  accent: string
  badge: string
  live: boolean
}
