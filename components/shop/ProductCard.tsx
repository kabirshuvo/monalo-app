"use client"

import React from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useCart } from '@/hooks/useCart'
import { formatPriceCents } from '@/lib/format'

export type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  stock?: number
  imageUrl?: string | null
  badge?: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { add } = useCart()
  const { id, slug, name, description, price, stock = 0, imageUrl, badge } = product
  const outOfStock = stock <= 0

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/shop/${slug}`} className="aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-50 block">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">No image yet</div>
        )}
      </Link>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/shop/${slug}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">{name}</h3>
            </Link>
            {description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
            )}
          </div>
          {badge && <Badge variant="info" size="sm">{badge}</Badge>}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPriceCents(price)}</span>
          <Button
            size="sm"
            disabled={outOfStock}
            onClick={() => add({ id, name, price })}
          >
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}
