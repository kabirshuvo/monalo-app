'use client'

import { useEffect, useState } from 'react'
import { ECO_PENGUIN_ITEMS_PER_PAGE } from '@/lib/ecopenguin/constants'
import { totalPages } from '@/lib/ecopenguin/game'
import { ecoTheme } from '@/features/ecopenguin/eco-theme'
import { stopEcoPenguinAudio } from '@/features/ecopenguin/hooks/useEcoPenguinAudio'
import ThisIsSection from '@/features/ecopenguin/components/ThisIsSection'
import WhichIsSection from '@/features/ecopenguin/components/WhichIsSection'
import type { EcoPenguinCategory, EcoPenguinItem } from '@/lib/ecopenguin/types'

type CategoryPlayProps = {
  category: EcoPenguinCategory
  items: EcoPenguinItem[]
}

export default function CategoryPlay({ category, items }: CategoryPlayProps) {
  const [page, setPage] = useState(1)
  const pages = totalPages(items.length, ECO_PENGUIN_ITEMS_PER_PAGE)

  useEffect(() => {
    stopEcoPenguinAudio()
  }, [page])

  const goToPage = (next: number) => {
    stopEcoPenguinAudio()
    setPage(next)
  }

  return (
    <div className="space-y-5">
      <div className={`${ecoTheme.cardSoft} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}>
        <p className="text-sm font-semibold text-sky-900">
          <span className="mr-1" aria-hidden>
            📚
          </span>
          {items.length} words
        </p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: pages }, (_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  i + 1 === page ? 'bg-teal-500 scale-110' : 'bg-sky-200'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(Math.max(1, page - 1))}
            className={`${ecoTheme.btnSecondary} px-3 py-2`}
            aria-label="Previous page"
          >
            ←
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-bold text-sky-800">
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => goToPage(Math.min(pages, page + 1))}
            className={`${ecoTheme.btnPrimary} px-3 py-2`}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>

      <ThisIsSection items={items} page={page} />
      <WhichIsSection category={category} items={items} page={page} />
    </div>
  )
}
