'use client'

import { useRouter } from 'next/navigation'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'
import { digraphTheme, DIGRAPH_ACCENT } from '@/features/digraphs/digraph-theme'
import { DigraphHighlight } from '@/features/digraphs/components/DigraphHighlight'
import DigraphPicture from '@/features/digraphs/components/DigraphPicture'
import { useWhichDigraphGame } from '@/features/digraphs/hooks/useWhichDigraphGame'
import { useDigraphsUi } from '@/features/digraphs/context/DigraphsUiContext'
import type { DigraphMeta, DigraphWord } from '@/lib/digraphs/types'

type Props = {
  digraph: DigraphMeta
  words: DigraphWord[]
  page: number
  preferUnmasteredWords?: string[]
  enabled?: boolean
  forceNewDeck?: boolean
  onDeckEmpty?: () => void
}

export default function WhichWordSection({
  digraph,
  words,
  page,
  preferUnmasteredWords,
  enabled = true,
  forceNewDeck = false,
  onDeckEmpty,
}: Props) {
  const router = useRouter()
  const { audioUnlocked, unlockAudio, showWord, toggleShowWord } = useDigraphsUi()
  const accent = DIGRAPH_ACCENT[digraph.id] ?? 'from-amber-400 to-orange-500'

  const {
    targetWord,
    pageWords,
    shakeId,
    isLocked,
    wrongIds,
    coachMessage,
    needsTapToListen,
    deckEmpty,
    replayQuestion,
    playQuestionSequence,
    handleGuess,
  } = useWhichDigraphGame({
    digraph,
    words,
    page,
    preferUnmasteredWords,
    enabled,
    forceNewDeck,
    onDeckEmpty,
    onCorrect: (word) => {
      router.push(
        `${DIGRAPHS_BASE_PATH}/${digraph.id}/${word.slug}?celebrate=1&page=${page}`
      )
    },
  })

  const targetMeta = pageWords.find((w) => w.word === targetWord)

  if (deckEmpty) return null

  return (
    <section className={`${digraphTheme.card} relative border-orange-100 p-4 sm:p-5`}>
      {!audioUnlocked && enabled && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-amber-950/45 p-4 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={() => {
              unlockAudio()
              playQuestionSequence()
            }}
            className={`${digraphTheme.btnPrimary} px-6 py-4 text-base shadow-lg`}
          >
            🔊 Tap to start listening
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={`${digraphTheme.pill} bg-orange-100 text-orange-900`}>Play</span>
          <h3 className="text-lg font-extrabold text-amber-950 sm:text-xl">
            Which word has {digraph.phoneme}?
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              unlockAudio()
              replayQuestion()
            }}
            disabled={!targetWord || isLocked}
            className={`${digraphTheme.btnPrimary} inline-flex items-center gap-2 px-5 py-3 text-base disabled:opacity-40`}
          >
            🔊 Listen again
          </button>
          <button
            type="button"
            onClick={toggleShowWord}
            className={`${digraphTheme.btnSecondary} px-3 py-2 text-xs sm:text-sm`}
          >
            {showWord ? 'Hide word' : 'Show word'}
          </button>
        </div>

        {showWord && targetMeta ? (
          <span
            className={`rounded-2xl bg-gradient-to-r ${accent} px-4 py-1.5 text-lg font-extrabold text-white shadow-sm sm:text-xl`}
          >
            <DigraphHighlight
              graphemes={targetMeta.graphemes}
              digraph={digraph.digraph}
              className="text-white"
            />
          </span>
        ) : (
          <p className="text-sm font-semibold text-amber-800/80">
            Listen for the digraph, then tap the matching word
          </p>
        )}
      </div>

      {needsTapToListen && audioUnlocked && (
        <p className="mb-3 text-center text-sm font-bold text-orange-800">
          Sound was blocked — tap Listen again
        </p>
      )}

      {coachMessage && (
        <p className="mb-3 text-center text-sm font-extrabold text-rose-700">{coachMessage}</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {pageWords.map((word, index) => {
          const isWrong = wrongIds.includes(word.id)
          return (
            <button
              key={word.id}
              type="button"
              disabled={isLocked || isWrong}
              onClick={() => handleGuess(word)}
              className={`rounded-2xl border-4 p-3 transition active:scale-95 disabled:opacity-60 ${
                shakeId === word.id
                  ? 'animate-pulse border-rose-400 bg-rose-50'
                  : isWrong
                    ? 'border-rose-200 bg-rose-50/70 opacity-50'
                    : 'border-transparent bg-amber-50/80 hover:border-amber-400 hover:shadow-md'
              }`}
            >
              <DigraphPicture
                src={word.image}
                word={word.word}
                alt={`Choice ${index + 1}`}
                className="mx-auto aspect-square w-full rounded-xl shadow-inner"
                sizes="(max-width: 768px) 40vw, 140px"
              />
              <span className="sr-only">Choice {index + 1}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-xs font-medium text-amber-800/75 sm:text-sm">
        Wrong answers stay dimmed so you can try again
      </p>
    </section>
  )
}
