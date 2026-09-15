import { VOWEL_WORDS_PER_PAGE } from '@/lib/vowel-words/constants'

export function paginateItems<T>(items: T[], page: number, perPage = VOWEL_WORDS_PER_PAGE): T[] {
  const index = Math.max(0, page - 1)
  return items.slice(index * perPage, (index + 1) * perPage)
}

export function totalPages(count: number, perPage = VOWEL_WORDS_PER_PAGE): number {
  return Math.max(1, Math.ceil(count / perPage))
}

export function shuffleItems<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildRoundDeck(names: string[]): string[] {
  return shuffleItems([...new Set(names.filter(Boolean))])
}
