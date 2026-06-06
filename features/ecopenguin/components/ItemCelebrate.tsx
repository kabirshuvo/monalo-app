'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { playEcoPenguinAudio } from '@/features/ecopenguin/hooks/useEcoPenguinAudio'
import api from '@/lib/api'
import type { EcoPenguinCategory, EcoPenguinItem } from '@/lib/ecopenguin/types'

type ItemCelebrateProps = {
  category: EcoPenguinCategory
  item: EcoPenguinItem
  itemSlug: string
  showConfetti?: boolean
}

export default function ItemCelebrate({ category, item, itemSlug, showConfetti }: ItemCelebrateProps) {
  const [burst, setBurst] = useState(showConfetti ?? true)
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null)

  useEffect(() => {
    if (!showConfetti) return
    const t = window.setTimeout(() => setBurst(false), 5000)
    return () => window.clearTimeout(t)
  }, [showConfetti])

  useEffect(() => {
    if (!showConfetti) return
    playEcoPenguinAudio(item.audio.success)
  }, [showConfetti, item.audio.success])

  useEffect(() => {
    if (!showConfetti) return

    let cancelled = false
    void (async () => {
      try {
        const res = await api.post<{ awarded?: boolean; points?: number }>(
          '/api/learning/ecopenguin/celebrate',
          {
            categorySlug: category.slug,
            itemSlug,
          }
        )
        if (!cancelled && res.awarded) {
          setPointsAwarded(res.points ?? 2)
        }
      } catch {
        // Non-blocking — play continues without points toast
      }
    })()

    return () => {
      cancelled = true
    }
  }, [showConfetti, category.slug, itemSlug])

  const first = item.name.charAt(0)
  const rest = item.name.slice(1)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {burst && (
        <p className="text-4xl animate-bounce" aria-hidden>
          🎉🐧✨
        </p>
      )}
      {pointsAwarded !== null && (
        <p className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-900">
          +{pointsAwarded} points!
        </p>
      )}
      <div className="w-full max-w-md rounded-2xl bg-white border-2 border-teal-200 p-6 shadow-lg text-center">
        <div className="relative aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden bg-teal-50">
          <Image src={item.image} alt={item.name} fill className="object-contain" sizes="320px" />
        </div>
        <h2 className="mt-6 text-4xl font-bold tracking-wide text-teal-950">
          <span className="text-rose-500">{first}</span>
          {rest}
        </h2>
        {item.description && (
          <p className="mt-3 text-sm text-teal-800/80 leading-relaxed">{item.description}</p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={`${ECO_PENGUIN_BASE_PATH}/categories/${category.slug}`}
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700"
        >
          Keep playing
        </Link>
        <Link
          href={ECO_PENGUIN_BASE_PATH}
          className="px-5 py-2.5 rounded-xl bg-white border border-teal-200 text-teal-800 font-medium hover:bg-teal-50"
        >
          All categories
        </Link>
      </div>
    </div>
  )
}
