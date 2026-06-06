'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { triggerSignIn } from '@/lib/auth/trigger-sign-in'
import type { BlogReactionCounts } from '@/lib/blog/stats'

type ReactionType = 'LOVE' | 'LIKE' | 'DISLIKE'

type BlogReactionsProps = {
  slug: string
  initialCounts?: BlogReactionCounts
  initialUserReaction?: ReactionType | null
}

const REACTIONS: {
  type: ReactionType
  label: string
  icon: string
  activeClass: string
}[] = [
  {
    type: 'LOVE',
    label: 'Love',
    icon: '♥',
    activeClass: 'border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-300',
  },
  {
    type: 'LIKE',
    label: 'Like',
    icon: '👍',
    activeClass: 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
  },
  {
    type: 'DISLIKE',
    label: 'Dislike',
    icon: '👎',
    activeClass: 'border-gray-400 bg-gray-100 text-gray-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300',
  },
]

export default function BlogReactions({
  slug,
  initialCounts,
  initialUserReaction = null,
}: BlogReactionsProps) {
  const { status } = useSession()
  const [counts, setCounts] = useState<BlogReactionCounts>(
    initialCounts ?? { love: 0, like: 0, dislike: 0, total: 0 }
  )
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialUserReaction)
  const [saving, setSaving] = useState<ReactionType | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog/${slug}/reactions`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setCounts(data.counts)
      setUserReaction(data.userReaction ?? null)
    } catch {
      // ignore
    }
  }, [slug])

  useEffect(() => {
    if (!initialCounts) void load()
  }, [initialCounts, load])

  const react = async (type: ReactionType) => {
    if (status !== 'authenticated') return
    setSaving(type)
    try {
      const nextType = userReaction === type ? null : type
      const res = await fetch(`/api/blog/${slug}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: nextType }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return
      setCounts(data.counts)
      setUserReaction(data.userReaction ?? null)
    } finally {
      setSaving(null)
    }
  }

  const countFor = (type: ReactionType) => {
    if (type === 'LOVE') return counts.love
    if (type === 'LIKE') return counts.like
    return counts.dislike
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">How was this article?</p>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ type, label, icon, activeClass }) => {
          const active = userReaction === type
          const disabled = saving !== null || status === 'loading'
          return (
            <button
              key={type}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => {
                if (status !== 'authenticated') {
                  triggerSignIn()
                  return
                }
                void react(type)
              }}
              className={[
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? activeClass
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50/50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-purple-800',
                status !== 'authenticated' ? 'opacity-90' : '',
              ].join(' ')}
            >
              <span aria-hidden>{icon}</span>
              <span>{label}</span>
              <span className="tabular-nums text-gray-500 dark:text-zinc-400">{countFor(type)}</span>
            </button>
          )
        })}
      </div>
      {status === 'unauthenticated' && (
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => triggerSignIn()}
            className="text-purple-600 hover:underline font-medium"
          >
            Sign in
          </button>{' '}
          to leave a reaction
        </p>
      )}
    </div>
  )
}
