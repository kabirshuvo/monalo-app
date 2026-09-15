export const LEARNING_HUB_PATH = '/learning'

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
