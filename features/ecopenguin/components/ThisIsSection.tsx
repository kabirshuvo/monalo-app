'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ECO_PENGUIN_ITEMS_PER_PAGE } from '@/lib/ecopenguin/constants'
import { paginateItems } from '@/lib/ecopenguin/game'
import { ecoTheme, ECO_PENGUIN_IMAGE_ASPECT } from '@/features/ecopenguin/eco-theme'
import { playEcoPenguinAudio } from '@/features/ecopenguin/hooks/useEcoPenguinAudio'
import type { EcoPenguinItem } from '@/lib/ecopenguin/types'

type ThisIsSectionProps = {
  items: EcoPenguinItem[]
  page: number
}

export default function ThisIsSection({ items, page }: ThisIsSectionProps) {
  const visible = paginateItems(items, page, ECO_PENGUIN_ITEMS_PER_PAGE)
  const [playingId, setPlayingId] = useState<number | null>(null)

  const handleTap = (item: EcoPenguinItem) => {
    setPlayingId(item.id)
    playEcoPenguinAudio(item.audio.itemAudio, () => setPlayingId(null))
  }

  return (
    <section className={`${ecoTheme.card} border-amber-100 p-4 sm:p-5`}>
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className={`${ecoTheme.pill} bg-amber-100 text-amber-900`}>Step 1</span>
        <h3 className="text-lg font-extrabold text-amber-950 sm:text-xl">This is…</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {visible.map((item) => {
          const isPlaying = playingId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTap(item)}
              className={`rounded-2xl border-2 overflow-hidden bg-amber-50/50 text-left transition active:scale-95 ${
                isPlaying
                  ? 'border-amber-400 ring-4 ring-amber-200 animate-eco-pop'
                  : 'border-transparent hover:border-amber-300 hover:shadow-md'
              }`}
            >
              <div className={`relative w-full ${ECO_PENGUIN_IMAGE_ASPECT}`}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className={ecoTheme.image}
                  sizes="(max-width: 768px) 40vw, 120px"
                />
                {isPlaying && (
                  <span className="absolute bottom-1 right-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    🔊
                  </span>
                )}
              </div>
              <p className="truncate px-2 py-2 text-center text-xs font-bold text-amber-950 sm:text-sm">
                {item.name}
              </p>
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-xs font-medium text-amber-800/75 sm:text-sm">
        Tap a picture to hear its name
      </p>
    </section>
  )
}
