"use client"

import Button from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'

type Props = {
  productId: string
  name: string
  price: number
  inStock: boolean
}

export default function ProductDetailClient({ productId, name, price, inStock }: Props) {
  const { add } = useCart()

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        disabled={!inStock}
        onClick={() => add({ id: productId, name, price })}
      >
        {inStock ? 'Add to cart' : 'Out of stock'}
      </Button>
      <Link href="/checkout">
        <Button variant="secondary">Go to checkout</Button>
      </Link>
    </div>
  )
}
