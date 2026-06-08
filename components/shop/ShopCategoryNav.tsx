import Link from 'next/link'
import {
  SHOP_CATEGORIES,
  CATEGORY_ACCENT_CLASSES,
  type ShopCategorySlug,
} from '@/lib/shop/categories'

type ShopCategoryNavProps = {
  activeSlug?: ShopCategorySlug
  counts?: Partial<Record<string, number>>
}

export default function ShopCategoryNav({ activeSlug, counts }: ShopCategoryNavProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            !activeSlug
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All crafts
          {counts?.all !== undefined && (
            <span className="ml-1 opacity-80">({counts.all})</span>
          )}
        </Link>
        {SHOP_CATEGORIES.map((category) => {
          const active = activeSlug === category.slug
          const accent = CATEGORY_ACCENT_CLASSES[category.accent]
          const count = counts?.[category.id]
          return (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : accent.chip
              }`}
            >
              <span aria-hidden className="mr-1">
                {category.emoji}
              </span>
              {category.label}
              {count !== undefined && count > 0 && (
                <span className={`ml-1 ${active ? 'opacity-80' : 'opacity-70'}`}>({count})</span>
              )}
            </Link>
          )
        })}
      </div>

      {!activeSlug && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_CATEGORIES.map((category) => {
            const accent = CATEGORY_ACCENT_CLASSES[category.accent]
            const count = counts?.[category.id] ?? 0
            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className={`group rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition hover:shadow-md ${accent.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-3xl" aria-hidden>
                    {category.emoji}
                  </span>
                  {count > 0 && (
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {count} items
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                  {category.heading}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-700">{category.subheading}</p>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{category.description}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
