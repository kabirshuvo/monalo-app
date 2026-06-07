'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ecoTheme, ECO_PENGUIN_IMAGE_ASPECT } from '@/features/ecopenguin/eco-theme'
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
      <section className={`${ecoTheme.card} relative overflow-hidden p-6 text-center sm:p-8`}>
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-100/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-emerald-100/70"
          aria-hidden
        />
        <p className="text-5xl sm:text-6xl" aria-hidden>
          🐧
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-sky-950 sm:text-3xl">
          Learn English with Eco Penguin
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-sky-800/85 sm:text-base">
          Pick a topic, tap the pictures, and play the listening games. Great for curious kids!
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className={`${ecoTheme.pill} bg-amber-100 text-amber-900`}>👂 Listen</span>
          <span className={`${ecoTheme.pill} bg-sky-100 text-sky-900`}>👀 Look</span>
          <span className={`${ecoTheme.pill} bg-emerald-100 text-emerald-900`}>🎯 Play</span>
        </div>
      </section>

      <div>
        <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-sky-700/80">
          Choose a category
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {visible.map((category) => (
            <Link
              key={category.id}
              href={`${ECO_PENGUIN_BASE_PATH}/categories/${category.slug}`}
              className={`${ecoTheme.cardSoft} group p-3 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg`}
            >
              <div
                className={`relative mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 ${ECO_PENGUIN_IMAGE_ASPECT}`}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className={`${ecoTheme.image} transition duration-300 group-hover:scale-[1.02]`}
                  sizes="(max-width: 768px) 45vw, 180px"
                />
              </div>
              <p className="text-center text-sm font-extrabold text-sky-950 sm:text-base">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={ecoTheme.btnSecondary}
          >
            ← Previous
          </button>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-900 shadow-sm">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={ecoTheme.btnPrimary}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
