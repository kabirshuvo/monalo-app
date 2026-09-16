'use client'

import { useState } from 'react'
import { DIGRAPHS_PER_PAGE } from '@/lib/digraphs/constants'
import { paginateItems } from '@/lib/digraphs/game'
import { digraphTheme } from '@/features/digraphs/digraph-theme'
import { DigraphHighlight } from '@/features/digraphs/components/DigraphHighlight'
import DigraphPicture from '@/features/digraphs/components/DigraphPicture'
import { playDigraphsAudio } from '@/features/digraphs/hooks/useDigraphsAudio'
import type { DigraphMeta, DigraphWord } from '@/lib/digraphs/types'

type Props = {
  digraph: DigraphMeta
  words: DigraphWord[]
  page: number
}

export default function LearnSection({ digraph, words, page }: Props) {
  const visible = paginateItems(words, page, DIGRAPHS_PER_PAGE)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const handleTap = (word: DigraphWord) => {
    setPlayingId(word.id)
    playDigraphsAudio(word.audio.word, {
      fallbackText: word.speakWord,
      onEnded: () => setPlayingId(null),
    })
  }

  return (
    <section className={`${digraphTheme.card} border-orange-100 p-4 sm:p-5`}>
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className={`${digraphTheme.pill} bg-orange-100 text-orange-900`}>Learn</span>
        <h3 className="text-lg font-extrabold text-amber-950 sm:text-xl">
          Words with {digraph.letter}
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
              className={`rounded-2xl border-2 bg-orange-50/60 p-3 text-center transition active:scale-95 ${
                isPlaying
                  ? 'border-orange-400 ring-4 ring-orange-200'
                  : 'border-transparent hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <DigraphPicture
                src={word.image}
                word={word.word}
                className="mx-auto aspect-square w-full rounded-xl shadow-inner"
                sizes="(max-width: 768px) 40vw, 120px"
              />
              <p className="mt-2 text-lg font-extrabold text-amber-950">
                <DigraphHighlight graphemes={word.graphemes} digraph={digraph.digraph} />
              </p>
              {isPlaying && (
                <span className="mt-1 inline-block text-[10px] font-bold text-orange-700">🔊</span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-xs font-medium text-amber-800/75 sm:text-sm">
        Tap a word to hear it — the highlighted letters are the digraph team
      </p>
    </section>
  )
}
