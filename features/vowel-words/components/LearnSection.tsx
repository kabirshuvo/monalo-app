'use client'

import { useState } from 'react'
import { VOWEL_WORDS_PER_PAGE } from '@/lib/vowel-words/constants'
import { paginateItems } from '@/lib/vowel-words/game'
import { vowelTheme } from '@/features/vowel-words/vowel-theme'
import { VowelHighlight } from '@/features/vowel-words/components/VowelHighlight'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { playVowelWordsAudio } from '@/features/vowel-words/hooks/useVowelWordsAudio'
import type { VowelMeta, VowelWord } from '@/lib/vowel-words/types'

type Props = {
  vowel: VowelMeta
  words: VowelWord[]
  page: number
}

export default function LearnSection({ vowel, words, page }: Props) {
  const visible = paginateItems(words, page, VOWEL_WORDS_PER_PAGE)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const handleTap = (word: VowelWord) => {
    setPlayingId(word.id)
    playVowelWordsAudio(word.audio.learn, {
      fallbackText: word.speak.learn,
      onEnded: () => setPlayingId(null),
    })
  }

  return (
    <section className={`${vowelTheme.card} border-[#fafaf9]/15 p-4 sm:p-5`}>
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className={`${vowelTheme.pill} bg-amber-400/20 text-orange-200`}>Learn</span>
        <h3 className="text-lg font-extrabold text-[#fafaf9] sm:text-xl">
          Let&apos;s learn 10 {vowel.letter} vowel words
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {visible.map((word) => {
          const isPlaying = playingId === word.id
          return (
            <button
              key={word.id}
              type="button"
              onClick={() => handleTap(word)}
              className={`rounded-2xl border-2 bg-[#fafaf9]/10 p-3 text-center transition active:scale-95 ${
                isPlaying
                  ? 'border-amber-400 ring-4 ring-amber-200'
                  : 'border-transparent hover:border-orange-400/70/60 hover:shadow-md'
              }`}
            >
              <WordPicture
                src={word.image}
                word={word.word}
                className="mx-auto aspect-square w-full rounded-xl shadow-inner"
                sizes="(max-width: 768px) 40vw, 120px"
              />
              <p className="mt-2 text-lg font-extrabold text-[#fafaf9]">
                <VowelHighlight graphemes={word.graphemes} vowelLetter={vowel.letter} />
              </p>
              {isPlaying && (
                <span className="mt-1 inline-block text-[10px] font-bold text-amber-300">🔊</span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-xs font-medium text-[#d6d3d1] sm:text-sm">
        Tap a picture to hear its name.
      </p>
    </section>
  )
}
