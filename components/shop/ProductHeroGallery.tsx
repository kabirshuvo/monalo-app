'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { formatPriceCents } from '@/lib/format'
import ProductCategoryBadge from '@/components/shop/ProductCategoryBadge'
import type { ShopCategoryId } from '@/lib/shop/categories'

export type ProductGalleryImage = {
  url: string
  alt: string | null
  order: number
}

type Props = {
  productId: string
  name: string
  description: string | null
  price: number
  stock: number
  category: ShopCategoryId
  images: ProductGalleryImage[]
}

export default function ProductHeroGallery({
  productId,
  name,
  description,
  price,
  stock,
  category,
  images,
}: Props) {
  const { add } = useCart()
  const [activeIndex, setActiveIndex] = useState(0)
  const inStock = stock > 0

  const active = images[activeIndex] ?? null
  const thumbs = images.slice(1, 5)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-subtle bg-surface shadow-sm">
        <div className="relative aspect-[16/10] bg-gray-50 sm:aspect-[2/1]">
          {active ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active.url}
              alt={active.alt || name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">No image yet</div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <div className="pointer-events-auto max-w-xl space-y-3 text-[#fafaf9]">
              <ProductCategoryBadge category={category} linked size="sm" />
              <h1 className="!text-[#fafaf9] text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1>
              {description ? (
                <p className="line-clamp-2 text-sm text-[#e7e5e4]/90 sm:text-base">{description}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <p className="text-2xl font-semibold text-[#fafaf9]">{formatPriceCents(price)}</p>
                <Button
                  disabled={!inStock}
                  onClick={() => add({ id: productId, name, price })}
                  className="!bg-[#fafaf9] !text-stone-900 hover:!bg-stone-100"
                >
                  {inStock ? 'Add to cart' : 'Out of stock'}
                </Button>
                <Link href="/checkout">
                  <Button
                    variant="secondary"
                    className="!border-[#fafaf9]/50 !bg-transparent !text-[#fafaf9] hover:!bg-[#fafaf9]/10"
                  >
                    Checkout
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-[#d6d3d1]">
                {inStock ? `${stock} in stock` : 'Currently unavailable'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {thumbs.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {thumbs.map((img, i) => {
            const index = i + 1
            const isActive = activeIndex === index
            return (
              <button
                key={`${img.url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden rounded-2xl border bg-gray-50 transition ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-subtle hover:border-gray-300'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-pressed={isActive}
              >
                <span className="block aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || `${name} detail ${index}`}
                    className="h-full w-full object-cover"
                  />
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      {/* Allow returning to hero when a thumb is selected */}
      {activeIndex > 0 && images[0] ? (
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to main image
        </button>
      ) : null}
    </div>
  )
}
