"use client"
import React from 'react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export type Product = {
  id: string
  name: string
  description: string
  price: string
  badge?: string
  image?: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, description, price, badge, image } = product

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">No image yet</div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
          </div>
          {badge && <Badge variant="info" size="sm">{badge}</Badge>}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{price}</span>
          <Button size="sm" onClick={() => console.log(`Add to cart: ${id}`)}>
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  )
}
