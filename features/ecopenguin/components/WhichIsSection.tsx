'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { itemNameToSlug } from '@/lib/ecopenguin/slug'
import { ecoTheme, ECO_PENGUIN_IMAGE_ASPECT } from '@/features/ecopenguin/eco-theme'
import { useWhichIsGame } from '@/features/ecopenguin/hooks/useWhichIsGame'
import type { EcoPenguinCategory, EcoPenguinItem } from '@/lib/ecopenguin/types'

type WhichIsSectionProps = {
  category: EcoPenguinCategory
  items: EcoPenguinItem[]
  page: number
}

export default function WhichIsSection({ category, items, page }: WhichIsSectionProps) {
  const router = useRouter()

  const { targetName, pageItems, shakeItemId, isLocked, replayQuestion, handleGuess } =
    useWhichIsGame({
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
    <section className={`${ecoTheme.card} border-emerald-100 p-4 sm:p-5`}>
      <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <span className={`${ecoTheme.pill} bg-emerald-100 text-emerald-900`}>Step 2</span>
        <div className="flex flex-wrap items-center justify-center gap-2 text-center">
          <h3 className="text-lg font-extrabold text-emerald-950 sm:text-xl">Which is</h3>
          <span className="rounded-2xl bg-gradient-to-r from-rose-400 to-orange-400 px-4 py-1.5 text-lg font-extrabold text-white shadow-sm sm:text-xl">
            {targetName || '…'}
          </span>
          <span className="text-lg font-extrabold text-emerald-950 sm:text-xl">?</span>
        </div>
        <button
          type="button"
          onClick={replayQuestion}
          disabled={!targetName || isLocked}
          className={`${ecoTheme.btnIcon} disabled:opacity-40`}
          aria-label="Play question again"
        >
          🔊
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {pageItems.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={isLocked}
            onClick={() => handleGuess(item)}
            className={`rounded-2xl overflow-hidden border-4 transition active:scale-95 disabled:opacity-60 ${
              shakeItemId === item.id
                ? 'animate-eco-shake border-rose-400 bg-rose-50'
                : 'border-transparent hover:border-emerald-400 hover:shadow-md focus:border-emerald-500'
            }`}
          >
            <div className={`relative w-full min-h-[88px] ${ECO_PENGUIN_IMAGE_ASPECT} sm:min-h-[110px]`}>
              <Image
                src={item.image}
                alt={item.name}
                fill
                className={ecoTheme.image}
                sizes="(max-width: 768px) 40vw, 160px"
              />
            </div>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs font-medium text-emerald-800/75 sm:text-sm">
        Listen, then tap the right picture
      </p>
    </section>
  )
}
