'use client'

import { useRouter } from 'next/navigation'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'
import { vowelTheme, VOWEL_ACCENT } from '@/features/vowel-words/vowel-theme'
import { VowelHighlight } from '@/features/vowel-words/components/VowelHighlight'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { useWhichWordGame } from '@/features/vowel-words/hooks/useWhichWordGame'
import { useVowelWordsUi } from '@/features/vowel-words/context/VowelWordsUiContext'
import type { VowelMeta, VowelWord } from '@/lib/vowel-words/types'

type Props = {
  vowel: VowelMeta
  words: VowelWord[]
  page: number
  preferUnmasteredWords?: string[]
  enabled?: boolean
  forceNewDeck?: boolean
  onDeckEmpty?: () => void
}

export default function WhichWordSection({
  vowel,
  words,
  page,
  preferUnmasteredWords,
  enabled = true,
  forceNewDeck = false,
  onDeckEmpty,
}: Props) {
  const router = useRouter()
  const { audioUnlocked, unlockAudio, showWord, toggleShowWord } = useVowelWordsUi()
  const accent = VOWEL_ACCENT[vowel.id] ?? 'from-violet-400 to-fuchsia-400'

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
  } = useWhichWordGame({
    vowel,
    words,
    page,
    preferUnmasteredWords,
    enabled,
    forceNewDeck,
    onDeckEmpty,
    onCorrect: (word) => {
      router.push(
        `${VOWEL_WORDS_BASE_PATH}/${vowel.id}/${word.slug}?celebrate=1&page=${page}`
      )
    },
  })

  if (deckEmpty) return null

  return (
    <section className={`${vowelTheme.card} relative border-fuchsia-100 p-4 sm:p-5`}>
      {!audioUnlocked && enabled && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-violet-950/45 p-4 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={() => {
              unlockAudio()
              playQuestionSequence()
            }}
            className={`${vowelTheme.btnPrimary} px-6 py-4 text-base shadow-lg`}
          >
            🔊 Tap to start listening
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={`${vowelTheme.pill} bg-fuchsia-100 text-fuchsia-900`}>Play</span>
          <h3 className="text-lg font-extrabold text-violet-950 sm:text-xl">
            Which word has {vowel.phoneme}?
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
            className={`${vowelTheme.btnPrimary} inline-flex items-center gap-2 px-5 py-3 text-base disabled:opacity-40`}
          >
            🔊 Listen again
          </button>
          <button
            type="button"
            onClick={toggleShowWord}
            className={`${vowelTheme.btnSecondary} px-3 py-2 text-xs sm:text-sm`}
          >
            {showWord ? 'Hide word' : 'Show word'}
          </button>
        </div>

        {showWord && targetWord ? (
          <span
            className={`rounded-2xl bg-gradient-to-r ${accent} px-4 py-1.5 text-lg font-extrabold text-white shadow-sm sm:text-xl`}
          >
            <VowelHighlight
              graphemes={targetWord.split('')}
              vowelLetter={vowel.letter}
              className="text-white"
            />
          </span>
        ) : (
          <p className="text-sm font-semibold text-violet-800/80">
            Listen for the vowel, then tap the matching word
          </p>
        )}
      </div>

      {needsTapToListen && audioUnlocked && (
        <p className="mb-3 text-center text-sm font-bold text-amber-800">
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
                    : 'border-transparent bg-violet-50/80 hover:border-violet-400 hover:shadow-md'
              }`}
            >
              <WordPicture
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
      <p className="mt-4 text-center text-xs font-medium text-violet-800/75 sm:text-sm">
        Wrong answers stay dimmed so you can try again
      </p>
    </section>
  )
}
