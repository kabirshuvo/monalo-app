'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ecoTheme, ECO_PENGUIN_IMAGE_ASPECT } from '@/features/ecopenguin/eco-theme'
import { ECO_PENGUIN_BASE_PATH, ECO_PENGUIN_CATEGORIES_PER_PAGE } from '@/lib/ecopenguin/constants'
import { readEcoPenguinSession, type EcoPenguinSession } from '@/lib/ecopenguin/session'
import type { EcoPenguinCategory } from '@/lib/ecopenguin/types'

export type CategoryProgress = {
  slug: string
  name: string
  total: number
  mastered: number
}

type EcoPenguinHubProps = {
  categories: EcoPenguinCategory[]
  progress?: CategoryProgress[]
}

export default function EcoPenguinHub({ categories, progress = [] }: EcoPenguinHubProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(ECO_PENGUIN_CATEGORIES_PER_PAGE)
  const [session, setSession] = useState<EcoPenguinSession | null>(null)

  useEffect(() => {
    const update = () => {
      setPerPage(window.innerWidth < 1024 ? 6 : ECO_PENGUIN_CATEGORIES_PER_PAGE)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    setSession(readEcoPenguinSession())
  }, [])

  const progressBySlug = useMemo(() => {
    const map = new Map<string, CategoryProgress>()
    for (const row of progress) map.set(row.slug, row)
    return map
  }, [progress])

  const totalPages = Math.max(1, Math.ceil(categories.length / perPage))
  const safePage = Math.min(page, totalPages)

  const visible = useMemo(() => {
    const start = (safePage - 1) * perPage
    return categories.slice(start, start + perPage)
  }, [categories, safePage, perPage])

  const continueCategory = session
    ? categories.find((c) => c.slug === session.categorySlug)
    : null

  const continueHref = session
    ? `${ECO_PENGUIN_BASE_PATH}/categories/${session.categorySlug}?page=${session.page}&mode=${session.mode}`
    : ECO_PENGUIN_BASE_PATH

  return (
    <div className="space-y-8">
      <section className={`${ecoTheme.card} relative overflow-hidden p-6 text-center sm:p-8`}>
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-400/20/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-emerald-400/20/70"
          aria-hidden
        />
        <p className="text-5xl sm:text-6xl" aria-hidden>
          🐧
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-[#fafaf9] sm:text-3xl">
          Explore
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#d6d3d1] sm:text-base">
          Pick a topic, learn the pictures, then play the listening game — Eco Penguin&apos;s picture
          room.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className={`${ecoTheme.pill} bg-amber-400/20 text-orange-200`}>👂 Listen</span>
          <span className={`${ecoTheme.pill} bg-sky-400/20 text-sky-200`}>👀 Look</span>
          <span className={`${ecoTheme.pill} bg-emerald-400/20 text-sky-200`}>🎯 Play</span>
        </div>
      </section>

      {continueCategory && session && (
        <section
          className={`${ecoTheme.card} flex flex-col items-center gap-4 border-[#fafaf9]/20 bg-gradient-to-r from-[#fafaf9]/10 to-[#fafaf9]/15 p-5 sm:flex-row sm:justify-between sm:p-6`}
        >
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Continue</p>
            <h3 className="mt-1 text-xl font-extrabold text-[#fafaf9]">
              Keep going with {continueCategory.name}
            </h3>
            <p className="mt-1 text-sm text-[#d6d3d1]">
              Page {session.page} · {session.mode === 'play' ? 'Listening game' : 'Learn mode'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={continueHref} className={`${ecoTheme.btnPrimary} px-6 py-3`}>
              Continue {continueCategory.name} →
            </Link>
            <Link href="#categories" className={ecoTheme.btnSecondary}>
              Pick another topic
            </Link>
          </div>
        </section>
      )}

      <div id="categories">
        <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-sky-300/80">
          Choose a category
        </h3>
        {categories.length === 0 ? (
          <p className={`${ecoTheme.cardSoft} py-12 text-center text-[#d6d3d1]`}>
            No categories yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {visible.map((category) => {
              const stats = progressBySlug.get(category.slug)
              const mastered = stats?.mastered ?? 0
              const total = stats?.total ?? 0
              return (
                <Link
                  key={category.id}
                  href={`${ECO_PENGUIN_BASE_PATH}/categories/${category.slug}`}
                  className={`${ecoTheme.cardSoft} group p-3 transition hover:-translate-y-0.5 hover:border-sky-400/60 hover:shadow-lg`}
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
                  <p className="text-center text-sm font-extrabold text-[#fafaf9] sm:text-base">
                    {category.name}
                  </p>
                  {total > 0 && (
                    <p className="mt-1 text-center text-xs font-bold text-amber-300">
                      ⭐ {mastered} of {total}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`${ecoTheme.btnSecondary} min-h-11 px-5`}
          >
            ← Previous
          </button>
          <span className="rounded-full bg-[#fafaf9]/12 px-4 py-2 text-sm font-bold text-emerald-200 shadow-sm">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`${ecoTheme.btnPrimary} min-h-11 px-5`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
