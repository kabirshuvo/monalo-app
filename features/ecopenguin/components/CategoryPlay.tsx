'use client'

import { useState } from 'react'
import { ECO_PENGUIN_ITEMS_PER_PAGE } from '@/lib/ecopenguin/constants'
import { totalPages } from '@/lib/ecopenguin/game'
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-teal-800">
          {items.length} words · Page {page} of {pages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-sm rounded-lg bg-white border border-teal-200 disabled:opacity-40"
          >
            ←
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="px-3 py-1.5 text-sm rounded-lg bg-teal-600 text-white disabled:opacity-40"
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
