'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { itemNameToSlug } from '@/lib/ecopenguin/slug'
import { useWhichIsGame } from '@/features/ecopenguin/hooks/useWhichIsGame'
import type { EcoPenguinCategory, EcoPenguinItem } from '@/lib/ecopenguin/types'

type WhichIsSectionProps = {
  category: EcoPenguinCategory
  items: EcoPenguinItem[]
  page: number
}

export default function WhichIsSection({ category, items, page }: WhichIsSectionProps) {
  const router = useRouter()

  const { targetName, pageItems, shakeItemId, replayQuestion, handleGuess } = useWhichIsGame({
    items,
    categorySlug: category.slug,
    page,
    onCorrect: (item) => {
      const itemSlug = itemNameToSlug(item.name)
      router.push(
        `${ECO_PENGUIN_BASE_PATH}/categories/${category.slug}/${itemSlug}?celebrate=1`
      )
    },
  })

  return (
    <section className="rounded-2xl bg-white/80 border border-emerald-200 p-4 shadow-sm mt-6">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-emerald-900 uppercase tracking-wide text-center">
          Which is {targetName || '…'}?
        </h3>
        <button
          type="button"
          onClick={replayQuestion}
          className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 hover:bg-emerald-200"
          aria-label="Play question again"
        >
          🔊
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
        {pageItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleGuess(item)}
            className={`rounded-xl overflow-hidden border-4 border-transparent hover:border-red-400 focus:border-red-500 transition-colors ${
              shakeItemId === item.id ? 'animate-eco-shake border-red-400' : ''
            }`}
          >
            <div className="relative aspect-[4/3] w-full min-h-[80px] md:min-h-[120px]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 180px"
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
