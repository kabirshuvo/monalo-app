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
        'inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-900',
        'bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 text-sm font-medium',
        'text-purple-800 dark:text-purple-200',
        'hover:bg-purple-100 dark:hover:bg-purple-950/70 transition-colors',
        className,
      ].join(' ')}
      title="View your points"
    >
      <span aria-hidden="true">★</span>
      <span>{points.toLocaleString()} points</span>
    </Link>
  )
}
