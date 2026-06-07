'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { ecoTheme, ECO_PENGUIN_IMAGE_ASPECT } from '@/features/ecopenguin/eco-theme'
import {
  playEcoPenguinAudio,
  stopEcoPenguinAudio,
} from '@/features/ecopenguin/hooks/useEcoPenguinAudio'
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
    stopEcoPenguinAudio()
    playEcoPenguinAudio(item.audio.success)
    return () => stopEcoPenguinAudio()
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
        // Non-blocking
      }
    })()

    return () => {
      cancelled = true
    }
  }, [showConfetti, category.slug, itemSlug])

  const first = item.name.charAt(0)
  const rest = item.name.slice(1)

  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-6 py-4">
      {burst && (
        <div className="flex animate-eco-pop flex-wrap items-center justify-center gap-2 text-4xl sm:text-5xl" aria-hidden>
          <span>🎉</span>
          <span>🐧</span>
          <span>⭐</span>
          <span>🎊</span>
        </div>
      )}
      {pointsAwarded !== null && (
        <p className="animate-eco-pop rounded-full bg-gradient-to-r from-amber-200 to-yellow-200 px-5 py-2 text-sm font-extrabold text-amber-950 shadow-sm">
          +{pointsAwarded} points!
        </p>
      )}
      <div className={`${ecoTheme.card} w-full max-w-md p-6 text-center sm:p-8`}>
        <div className={`relative mx-auto w-full max-w-xs overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 to-emerald-50 ${ECO_PENGUIN_IMAGE_ASPECT}`}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={ecoTheme.image}
            sizes="320px"
          />
        </div>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-700">Great job!</p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-wide text-sky-950 sm:text-5xl">
          <span className="text-rose-500">{first}</span>
          {rest}
        </h2>
        {item.description && (
          <p className="mt-3 text-sm leading-relaxed text-sky-800/80">{item.description}</p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={`${ECO_PENGUIN_BASE_PATH}/categories/${category.slug}`} className={ecoTheme.btnPrimary}>
          Keep playing →
        </Link>
        <Link href={ECO_PENGUIN_BASE_PATH} className={ecoTheme.btnSecondary}>
          All categories
        </Link>
      </div>
    </div>
  )
}
