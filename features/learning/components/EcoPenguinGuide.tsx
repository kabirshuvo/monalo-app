'use client'

import { useEffect, useState } from 'react'

export type GuideRoom =
  | 'hub'
  | 'balloon-letters'
  | 'letter-sounds'
  | 'blend-the-word'
  | 'ecopenguin'
  | 'vowel-words'
  | 'digraphs'
  | 'build-the-word'

export type GuideOverride = {
  tipId: string
  message: string
}

const TIPS: Record<GuideRoom, { tipId: string; message: string }> = {
  hub: {
    tipId: 'hub-welcome',
    message: 'Hi! I am Eco Penguin. Start with Letter sounds, then catch balloons to earn stickers.',
  },
  'balloon-letters': {
    tipId: 'balloon-listen',
    message: 'Listen carefully, then tap the balloon with that letter. Finish a set to earn a sticker!',
  },
  'letter-sounds': {
    tipId: 'letter-sounds-tap',
    message: 'Tap a letter to hear the word and the sound. Locked sets open after Balloon stickers.',
  },
  'blend-the-word': {
    tipId: 'blend-listen',
    message: 'Hear each sound, then the whole word. Tap the picture that matches.',
  },
  ecopenguin: {
    tipId: 'eco-explore',
    message: 'Explore pictures with me — listen, learn the name, then play Which Is.',
  },
  'vowel-words': {
    tipId: 'vowel-short',
    message: 'Short vowels a e i o u — learn the words, then listen for the vowel.',
  },
  digraphs: {
    tipId: 'digraph-teams',
    message: 'Two letters, one sound — sh, ch, th, wh. Listen and pick the word.',
  },
  'build-the-word': {
    tipId: 'build-spell',
    message: 'Hear the word, then tap letters to spell it yourself.',
  },
}

const STORAGE_KEY = 'ecopenguin:guide-tips'

function readSeen(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function writeSeen(seen: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]))
  } catch {
    // ignore
  }
}

type Props = {
  room: GuideRoom
  /** When set, always show this message (e.g. sticker gift). */
  override?: GuideOverride | null
}

export default function EcoPenguinGuide({ room, override = null }: Props) {
  const tip = TIPS[room]
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState(tip.message)
  const [activeTipId, setActiveTipId] = useState(tip.tipId)

  useEffect(() => {
    if (override) {
      setMessage(override.message)
      setActiveTipId(override.tipId)
      setVisible(true)
      return
    }
    const seen = readSeen()
    if (seen.has(tip.tipId)) {
      setVisible(false)
      return
    }
    setMessage(tip.message)
    setActiveTipId(tip.tipId)
    setVisible(true)
  }, [room, tip.tipId, tip.message, override])

  const dismiss = () => {
    const seen = readSeen()
    seen.add(activeTipId)
    writeSeen(seen)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-40 max-w-[min(100%-2rem,20rem)] sm:bottom-6 sm:left-6"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-end gap-2">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#fafaf9]/25 bg-[#1c1917] shadow-lg shadow-black/40"
          aria-hidden
        >
          <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden>
            <ellipse cx="32" cy="40" rx="18" ry="20" fill="#0c0a09" />
            <ellipse cx="32" cy="40" rx="12" ry="14" fill="#fafaf9" />
            <circle cx="32" cy="22" r="14" fill="#0c0a09" />
            <circle cx="26" cy="20" r="3" fill="#fafaf9" />
            <circle cx="38" cy="20" r="3" fill="#fafaf9" />
            <circle cx="27" cy="20" r="1.4" fill="#0c0a09" />
            <circle cx="39" cy="20" r="1.4" fill="#0c0a09" />
            <path d="M28 26 L36 26 L32 32 Z" fill="#fbbf24" />
            <ellipse cx="18" cy="42" rx="5" ry="8" fill="#0c0a09" transform="rotate(-20 18 42)" />
            <ellipse cx="46" cy="42" rx="5" ry="8" fill="#0c0a09" transform="rotate(20 46 42)" />
            <ellipse cx="26" cy="58" rx="5" ry="3" fill="#fbbf24" />
            <ellipse cx="38" cy="58" rx="5" ry="3" fill="#fbbf24" />
          </svg>
        </div>
        <div className="rounded-2xl border border-[#fafaf9]/20 bg-[#1c1917]/95 px-3 py-2 shadow-lg shadow-black/40 backdrop-blur-sm">
          <p className="text-sm font-semibold leading-snug text-[#fafaf9]">{message}</p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-2 text-xs font-bold text-sky-300 hover:underline"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
