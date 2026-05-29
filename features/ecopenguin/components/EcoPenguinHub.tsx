'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ECO_PENGUIN_BASE_PATH, ECO_PENGUIN_CATEGORIES_PER_PAGE } from '@/lib/ecopenguin/constants'
import type { EcoPenguinCategory } from '@/lib/ecopenguin/types'

type EcoPenguinHubProps = {
  categories: EcoPenguinCategory[]
}

export default function EcoPenguinHub({ categories }: EcoPenguinHubProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(ECO_PENGUIN_CATEGORIES_PER_PAGE)

  useEffect(() => {
    const update = () => {
      setPerPage(window.innerWidth < 1024 ? 6 : ECO_PENGUIN_CATEGORIES_PER_PAGE)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const totalPages = Math.max(1, Math.ceil(categories.length / perPage))
  const safePage = Math.min(page, totalPages)

  const visible = useMemo(() => {
    const start = (safePage - 1) * perPage
    return categories.slice(start, start + perPage)
  }, [categories, safePage, perPage])

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white/70 border border-teal-200 p-6 text-center shadow-sm">
        <p className="text-4xl mb-2" aria-hidden>
          🐧
        </p>
        <h2 className="text-2xl font-bold text-teal-900">Learn English with Eco Penguin</h2>
        <p className="mt-2 text-teal-800/80 max-w-lg mx-auto">
          Tap a category. Listen, look, and play — just like the classic This Is / Which Is games.
        </p>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((category) => (
          <Link
            key={category.id}
            href={`${ECO_PENGUIN_BASE_PATH}/categories/${category.slug}`}
            className="group rounded-2xl bg-white border-2 border-teal-100 p-3 shadow-sm hover:border-teal-400 hover:shadow-md transition-all"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-teal-50 mb-3">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 768px) 50vw, 200px"
              />
            </div>
            <p className="text-center font-semibold text-teal-900">{category.name}</p>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg bg-white border border-teal-200 text-teal-800 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-teal-800 text-sm">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
