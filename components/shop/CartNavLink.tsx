'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

export default function CartNavLink() {
  const { items } = useCart()
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Link
      href="/checkout"
      className="relative inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
      aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
