'use client'

import Link from 'next/link'
import { useAuthNav } from '@/lib/auth/use-auth-nav'

export default function TotalPointsBadge({ className = '' }: { className?: string }) {
  const { session, isAuthenticated } = useAuthNav()

  if (!isAuthenticated || !session?.user) return null

  const points = session.user?.totalPoints ?? 0

  return (
    <Link
      href="/profile"
      className={[
        'inline-flex items-center gap-1.5 rounded-full border border-[var(--orbit-line-strong)]',
        'px-3 py-1.5 text-sm font-bold text-content',
        'hover:bg-[var(--surface-hover)] transition-colors',
        className,
      ].join(' ')}
      title="View your points"
    >
      <span aria-hidden="true" className="text-[var(--sun)]">★</span>
      <span>{points.toLocaleString()} points</span>
    </Link>
  )
}
