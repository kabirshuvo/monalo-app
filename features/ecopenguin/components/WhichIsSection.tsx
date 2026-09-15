'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { itemNameToSlug } from '@/lib/ecopenguin/slug'
import { ecoTheme, ECO_PENGUIN_IMAGE_ASPECT } from '@/features/ecopenguin/eco-theme'
import { useWhichIsGame } from '@/features/ecopenguin/hooks/useWhichIsGame'
import { useEcoPenguinUi } from '@/features/ecopenguin/context/EcoPenguinUiContext'
import type { EcoPenguinCategory, EcoPenguinItem } from '@/lib/ecopenguin/types'

type WhichIsSectionProps = {
  category: EcoPenguinCategory
  items: EcoPenguinItem[]
  page: number
  preferUnmasteredNames?: string[]
  enabled?: boolean
  forceNewDeck?: boolean
  onDeckEmpty?: () => void
}

export default function WhichIsSection({
  category,
  items,
  page,
  preferUnmasteredNames,
  enabled = true,
  forceNewDeck = false,
  onDeckEmpty,
}: WhichIsSectionProps) {
  const router = useRouter()
  const { audioUnlocked, unlockAudio, showWord, toggleShowWord } = useEcoPenguinUi()

  const {
    targetName,
    pageItems,
    shakeItemId,
    isLocked,
    wrongIds,
    coachMessage,
    needsTapToListen,
    deckEmpty,
    replayQuestion,
    playQuestionSequence,
    handleGuess,
  } = useWhichIsGame({
    items,
    categorySlug: category.slug,
    page,
    preferUnmasteredNames,
    enabled,
    forceNewDeck,
    onDeckEmpty,
    onCorrect: (item) => {
      const itemSlug = itemNameToSlug(item.name)
      router.push(
        `${ECO_PENGUIN_BASE_PATH}/categories/${category.slug}/${itemSlug}?celebrate=1&page=${page}`
      )
    },
  })

  const startListening = () => {
    unlockAudio()
    playQuestionSequence()
  }

  if (deckEmpty) {
    return null
  }

  return (
    <section className={`${ecoTheme.card} relative border-emerald-100 p-4 sm:p-5`}>
      {!audioUnlocked && enabled && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-emerald-950/45 p-4 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={startListening}
            className={`${ecoTheme.btnPrimary} px-6 py-4 text-base shadow-lg`}
          >
            🔊 Tap to start listening
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={`${ecoTheme.pill} bg-emerald-100 text-emerald-900`}>Play</span>
          <h3 className="text-lg font-extrabold text-emerald-950 sm:text-xl">Which is…?</h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              unlockAudio()
              replayQuestion()
            }}
            disabled={!targetName || isLocked}
            className={`${ecoTheme.btnPrimary} inline-flex items-center gap-2 px-5 py-3 text-base disabled:opacity-40`}
            aria-label="Play question again"
          >
            🔊 Listen again
          </button>
          <button
            type="button"
            onClick={toggleShowWord}
            className={`${ecoTheme.btnSecondary} px-3 py-2 text-xs sm:text-sm`}
          >
            {showWord ? 'Hide word' : 'Show word'}
          </button>
        </div>

        {showWord && targetName ? (
          <span className="rounded-2xl bg-gradient-to-r from-rose-400 to-orange-400 px-4 py-1.5 text-lg font-extrabold text-white shadow-sm sm:text-xl">
            {targetName}
          </span>
        ) : (
          <p className="text-sm font-semibold text-emerald-800/80">
            Listen carefully, then tap the picture
          </p>
        )}
      </div>

      {needsTapToListen && audioUnlocked && (
        <p className="mb-3 text-center text-sm font-bold text-amber-800">
          Sound was blocked — tap Listen again
        </p>
      )}

      {coachMessage && (
        <p className="mb-3 animate-eco-pop text-center text-sm font-extrabold text-rose-700">
          {coachMessage}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {pageItems.map((item, index) => {
          const isWrong = wrongIds.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              disabled={isLocked || isWrong}
              onClick={() => handleGuess(item)}
              className={`rounded-2xl overflow-hidden border-4 transition active:scale-95 disabled:opacity-60 ${
                shakeItemId === item.id
                  ? 'animate-eco-shake border-rose-400 bg-rose-50'
                  : isWrong
                    ? 'border-rose-200 bg-rose-50/70 opacity-50'
                    : 'border-transparent hover:border-emerald-400 hover:shadow-md focus:border-emerald-500'
              }`}
            >
              <div
                className={`relative w-full min-h-[88px] ${ECO_PENGUIN_IMAGE_ASPECT} sm:min-h-[110px]`}
              >
                <Image
                  src={item.image}
                  alt={`Choice ${index + 1}`}
                  fill
                  className={ecoTheme.image}
                  sizes="(max-width: 768px) 40vw, 160px"
                />
              </div>
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-xs font-medium text-emerald-800/75 sm:text-sm">
        Wrong answers stay dimmed so you can try again
      </p>
    </section>
  )
}
