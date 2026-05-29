'use client'

import Image from 'next/image'
import { ECO_PENGUIN_ITEMS_PER_PAGE } from '@/lib/ecopenguin/constants'
import { paginateItems } from '@/lib/ecopenguin/game'
import { playEcoPenguinAudio } from '@/features/ecopenguin/hooks/useEcoPenguinAudio'
import type { EcoPenguinItem } from '@/lib/ecopenguin/types'

type ThisIsSectionProps = {
  items: EcoPenguinItem[]
  page: number
}

export default function ThisIsSection({ items, page }: ThisIsSectionProps) {
  const visible = paginateItems(items, page, ECO_PENGUIN_ITEMS_PER_PAGE)

  return (
    <section className="rounded-2xl bg-white/80 border border-teal-200 p-4 shadow-sm">
      <h3 className="text-center text-lg font-bold text-teal-900 uppercase tracking-wide mb-4">
        This is…
      </h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => playEcoPenguinAudio(item.audio.itemAudio)}
            className="rounded-xl border-2 border-transparent hover:border-amber-400 focus:border-amber-500 overflow-hidden bg-teal-50 transition-colors"
          >
            <div className="relative aspect-square w-full">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
            <p className="text-xs font-medium text-teal-900 py-1 truncate px-1">{item.name}</p>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-teal-700/70 mt-3">Tap a picture to hear its name</p>
    </section>
  )
}
