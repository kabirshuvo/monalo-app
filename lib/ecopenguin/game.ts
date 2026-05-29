import { ECO_PENGUIN_ITEMS_PER_PAGE } from '@/lib/ecopenguin/constants'
import type { EcoPenguinItem } from '@/lib/ecopenguin/types'

export function paginateItems<T>(items: T[], page: number, perPage = ECO_PENGUIN_ITEMS_PER_PAGE): T[] {
  const index = Math.max(0, page - 1)
  return items.slice(index * perPage, (index + 1) * perPage)
}

export function totalPages(count: number, perPage = ECO_PENGUIN_ITEMS_PER_PAGE): number {
  return Math.max(1, Math.ceil(count / perPage))
}

/** Fisher–Yates shuffle (copy). */
export function shuffleItems<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function pickRandomItem(items: EcoPenguinItem[]): EcoPenguinItem | null {
  if (items.length === 0) return null
  return items[Math.floor(Math.random() * items.length)]
}

export function pickRandomItemName(items: EcoPenguinItem[]): string {
  return pickRandomItem(items)?.name ?? ''
}
