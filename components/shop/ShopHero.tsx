'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import {
  SHOP_CATEGORIES,
  CATEGORY_ACCENT_CLASSES,
  type ShopCategory,
} from '@/lib/shop/categories'

type CategoryCountMap = Partial<Record<string, number>>

type ShopHeroProps = {
  counts: CategoryCountMap
}

export default function ShopHero({ counts }: ShopHeroProps) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-subtle bg-surface shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(37,99,235,0.14),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.12),_transparent_45%)]"
          aria-hidden
        />
        <div className="relative px-6 py-14 sm:px-10 sm:py-20 lg:px-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">MonAlo Craft Shop</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Handmade crafts that fund the school
          </h1>
          <p className="mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
            Gypsum pottery, candles, wood, bamboo, books, and more — browse by category or scroll the
            shelves below.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <span aria-hidden>☰</span>
              Categories
              {typeof counts.all === 'number' ? (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                  {counts.all} items
                </span>
              ) : null}
            </button>
            <a
              href="#shop-shelves"
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              Browse shelves
            </a>
          </div>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-50 m-0 max-h-[min(85vh,40rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-subtle bg-surface p-0 shadow-2xl backdrop:bg-black/40 open:flex open:flex-col"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false)
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-subtle px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              Shop categories
            </h2>
            <p className="mt-1 text-sm text-gray-500">Jump to a shelf or open that category.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close categories"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ul className="overflow-y-auto p-3">
          {SHOP_CATEGORIES.map((category) => (
            <CategoryPopupRow
              key={category.id}
              category={category}
              count={counts[category.id] ?? 0}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </ul>
      </dialog>
    </>
  )
}

function CategoryPopupRow({
  category,
  count,
  onNavigate,
}: {
  category: ShopCategory
  count: number
  onNavigate: () => void
}) {
  const accent = CATEGORY_ACCENT_CLASSES[category.accent]

  return (
    <li>
      <div
        className={`mb-2 flex items-stretch gap-2 rounded-2xl border bg-gradient-to-br p-3 ${accent.card}`}
      >
        <a
          href={`#shelf-${category.slug}`}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-xl p-1 text-left transition hover:opacity-90"
        >
          <span className="text-2xl" aria-hidden>
            {category.emoji}
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-gray-900">{category.label}</span>
            <span className="mt-0.5 block text-sm text-gray-600 line-clamp-2">
              {category.subheading}
            </span>
            <span className="mt-1 block text-xs font-medium text-gray-500">
              {count > 0 ? `${count} item${count === 1 ? '' : 's'}` : 'No items yet'}
            </span>
          </span>
        </a>
        <Link
          href={`/shop?category=${category.slug}`}
          onClick={onNavigate}
          className="shrink-0 self-center rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-white"
        >
          Open
        </Link>
      </div>
    </li>
  )
}
