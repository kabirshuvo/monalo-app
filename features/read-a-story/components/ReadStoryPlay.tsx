'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readStoryTheme } from '@/features/read-a-story/read-story-theme'
import { playVowelWordsAudio, stopVowelWordsAudio } from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { READ_STORY_BASE_PATH } from '@/lib/read-a-story/constants'
import { writeReadStorySession } from '@/lib/read-a-story/session'
import type { DecodableStory } from '@/lib/read-a-story/types'

type Props = {
  stories: DecodableStory[]
  completedIds?: string[]
}

export default function ReadStoryPlay({ stories, completedIds = [] }: Props) {
  const [storyId, setStoryId] = useState<string | null>(stories[0]?.id ?? null)
  const [page, setPage] = useState(0)
  const [done, setDone] = useState(false)

  const story = stories.find((s) => s.id === storyId) ?? stories[0]

  useEffect(() => () => stopVowelWordsAudio(), [])

  useEffect(() => {
    if (!story) return
    writeReadStorySession({ storyId: story.id, page: page + 1 })
  }, [story, page])

  if (!story) {
    return (
      <p className={`${readStoryTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        Finish more Balloon letter sets to unlock stories.
      </p>
    )
  }

  const pageData = story.pages[page]
  const isLast = page >= story.pages.length - 1

  const speakWord = (word: string) => {
    playVowelWordsAudio('', { fallbackText: word.replace(/[^a-zA-Z]/g, '') || word })
  }

  const nextPage = () => {
    if (!isLast) {
      setPage((p) => p + 1)
      setDone(false)
      return
    }
    setDone(true)
    void api.post('/api/learning/read-a-story/celebrate', { storyId: story.id }).catch(() => undefined)
  }

  if (done) {
    return (
      <div className={`${readStoryTheme.card} space-y-4 p-8 text-center`}>
        <p className="text-4xl" aria-hidden>
          📖⭐
        </p>
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">You finished the story!</h2>
        <p className="text-sm font-bold text-amber-300">+5 points</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className={readStoryTheme.btnPrimary}
            onClick={() => {
              setPage(0)
              setDone(false)
            }}
          >
            Read again
          </button>
          <Link href={READ_STORY_BASE_PATH} className={readStoryTheme.btnSecondary}>
            More stories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap gap-2">
        {stories.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setStoryId(s.id)
              setPage(0)
              setDone(false)
            }}
            className={`${readStoryTheme.btnSecondary} ${
              s.id === story.id ? 'ring-2 ring-amber-300' : ''
            }`}
          >
            {s.title}
            {completedIds.includes(s.id) ? ' ★' : ''}
          </button>
        ))}
      </section>

      <section className={`${readStoryTheme.card} space-y-6 p-6 text-center sm:p-10`}>
        <p className="text-sm font-bold uppercase tracking-widest text-amber-300">
          {story.title} · page {page + 1}/{story.pages.length}
        </p>
        <p className="text-3xl font-extrabold leading-relaxed text-[#fafaf9] sm:text-4xl">
          {pageData.words.map((word, i) => (
            <button
              key={`${word}-${i}`}
              type="button"
              onClick={() => speakWord(word)}
              className="mx-1 inline-block rounded-xl px-1.5 py-0.5 hover:bg-amber-400/20"
            >
              {word}
            </button>
          ))}
        </p>
        <p className="text-sm text-[#a8a29e]">Tap a word to hear it</p>
        <button type="button" onClick={nextPage} className={`${readStoryTheme.btnPrimary} px-6 py-3`}>
          {isLast ? 'Finish story' : 'Next page'}
        </button>
      </section>
    </div>
  )
}
