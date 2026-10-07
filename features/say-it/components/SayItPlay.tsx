'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import SpeechTunerMeter from '@/features/say-it/components/SpeechTunerMeter'
import { sayItTheme } from '@/features/say-it/say-it-theme'
import {
  ensureMicPermission,
  getSpeechDeviceInfo,
  listenOnce,
  type SpeechDeviceInfo,
} from '@/features/say-it/hooks/speechRecognition'
import {
  playVowelWordsAudio,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { writeSayItSession } from '@/lib/say-it/session'
import type { SayItPrompt } from '@/lib/say-it/constants'
import { ECO_PENGUIN_MASTERY_HITS } from '@/lib/learning/cambridge-esl'
import { recordMasteryHit } from '@/lib/learning/spaced-mastery'
import { scoreSpeechMatch, SPEECH_MATCH_PASS } from '@/lib/say-it/speech-match'

type Props = {
  prompts: SayItPrompt[]
  masteredKeys?: string[]
}

export default function SayItPlay({ prompts, masteredKeys = [] }: Props) {
  const [heard, setHeard] = useState<string[]>([])
  const [target, setTarget] = useState<SayItPrompt | null>(null)
  const [phase, setPhase] = useState<'listen' | 'say' | 'done'>('listen')
  const [hitHint, setHitHint] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [device, setDevice] = useState<SpeechDeviceInfo | null>(null)
  const [listening, setListening] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [heardLabel, setHeardLabel] = useState<string | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const [micReady, setMicReady] = useState(false)

  useEffect(() => {
    setDevice(getSpeechDeviceInfo())
  }, [])

  const micSupported = Boolean(device?.supported)
  const isMobile = Boolean(device?.isMobile)

  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const id of heard) set.add(id)
    return set
  }, [masteredKeys, heard])

  const pickNext = useCallback(
    (excludeId?: string) => {
      const unseen = prompts.filter((p) => p.id !== excludeId && !mastered.has(p.id))
      const pool = unseen.length > 0 ? unseen : prompts.filter((p) => p.id !== excludeId)
      if (pool.length === 0) return prompts[0] ?? null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [prompts, mastered]
  )

  const ask = useCallback((prompt: SayItPrompt) => {
    stopVowelWordsAudio()
    setTarget(prompt)
    setPhase('listen')
    setHitHint(null)
    setChecking(false)
    setScore(null)
    setHeardLabel(null)
    setMicError(null)
    setListening(false)
    writeSayItSession({ promptId: prompt.id, label: prompt.label })
    playVowelWordsAudio(prompt.audio ?? '', { fallbackText: prompt.speak })
    // Phones need a longer gap before Speak is useful (TTS still holding the audio route)
    window.setTimeout(() => setPhase('say'), isMobile ? 1400 : 900)
  }, [isMobile])

  useEffect(() => {
    const first = pickNext()
    if (first) ask(first)
    return () => stopVowelWordsAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finishCorrect = useCallback(
    (prompt: SayItPrompt) => {
      setChecking(true)
      setPhase('done')
      const result = recordMasteryHit('say-it', prompt.id)
      if (result.justMastered) {
        playVowelWordsAudio('/say-it/audio/success.mp3', { fallbackText: 'Great speaking!' })
        void api.post('/api/learning/say-it/celebrate', { promptId: prompt.id }).catch(() => undefined)
        setHeard((prev) => (prev.includes(prompt.id) ? prev : [...prev, prompt.id]))
        setHitHint('+2 points! Next…')
      } else if (result.alreadyMastered) {
        playVowelWordsAudio('/say-it/audio/success.mp3', { fallbackText: 'Great speaking!' })
        setHitHint('Already practised — keep going!')
      } else {
        playVowelWordsAudio('/say-it/audio/success.mp3', {
          fallbackText: 'Good! Say it once more next time.',
        })
        setHitHint(`Nice! ${result.hits}/${ECO_PENGUIN_MASTERY_HITS} to master`)
      }
      const next = pickNext(prompt.id)
      window.setTimeout(() => {
        if (next) ask(next)
      }, 1800)
    },
    [ask, pickNext]
  )

  if (!target) {
    return (
      <p className={`${sayItTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No speaking prompts yet.
      </p>
    )
  }

  const replay = () => {
    stopVowelWordsAudio()
    playVowelWordsAudio(target.audio ?? '', { fallbackText: target.speak })
    setPhase('say')
    setScore(null)
    setHeardLabel(null)
    setMicError(null)
  }

  const saidItHonor = () => {
    if (checking || phase === 'done') return
    finishCorrect(target)
  }

  const listenWithMic = async () => {
    if (checking || phase === 'done' || listening) return
    // Critical on iOS: avoid long awaits before recognition.start() or the user-gesture is lost
    stopVowelWordsAudio()
    setListening(true)
    setMicError(null)
    setScore(null)
    setHeardLabel(null)

    try {
      // Android benefits from an explicit mic permission prompt; iOS must start recognition ASAP
      if (!micReady && device?.isAndroid) {
        const perm = await ensureMicPermission()
        if (perm === 'denied') {
          setListening(false)
          setMicError('Allow Microphone in Chrome — or tap “I said it”.')
          return
        }
        setMicReady(true)
      }

      const result = await listenOnce({
        lang: 'en-US',
        mobile: isMobile,
        ios: device?.isIos,
      })
      setMicReady(true)
      const match = scoreSpeechMatch(result.transcript, target.speak)
      setScore(match)
      setHeardLabel(result.transcript)
      setListening(false)
      if (match >= SPEECH_MATCH_PASS) {
        finishCorrect(target)
      } else {
        playVowelWordsAudio('/say-it/audio/error.mp3', { fallbackText: 'Try again' })
        setMicError(
          isMobile
            ? 'Not quite — hold the phone closer, hear again, then Speak.'
            : 'Not quite — hear again, then speak clearly.'
        )
      }
    } catch (err) {
      setListening(false)
      const code = err instanceof Error ? err.message : 'error'
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setMicError(
          isMobile
            ? 'Microphone blocked on this phone — allow Mic, or use “I said it”.'
            : 'Microphone blocked — use “I said it”, or allow mic in the browser.'
        )
      } else if (code === 'insecure') {
        setMicError('Mic needs https. Use “I said it” for now.')
      } else if (code === 'timeout' || code === 'ended' || code === 'empty' || code === 'no-speech') {
        setMicError(
          isMobile
            ? 'Didn’t catch that — tap Speak, wait for Listening…, then say it louder.'
            : 'Didn’t catch that — try again a little louder.'
        )
      } else if (code === 'unsupported') {
        setMicError('This browser has no speech mic — try Chrome, or tap “I said it”.')
      } else if (code === 'start-failed' && device?.isIos) {
        setMicError('iPhone needs a fresh tap — tap Speak again right after Listening…')
      } else {
        setMicError('Mic hiccup — try Speak again or tap “I said it”.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <section className={`${sayItTheme.card} space-y-4 p-6 text-center sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-300">
          Say it · {target.kind === 'phrase' ? 'phrase' : 'word'}
        </p>
        <h2 className="text-3xl font-extrabold text-[#fafaf9] sm:text-4xl">{target.label}</h2>
        {target.image && (
          <div className="mx-auto max-w-[220px]">
            <WordPicture
              src={target.image}
              word={target.label}
              alt={target.label}
              className="aspect-square w-full rounded-2xl"
              sizes="220px"
            />
          </div>
        )}

        {micSupported && phase !== 'listen' && (
          <SpeechTunerMeter score={score} listening={listening} label={heardLabel ?? undefined} />
        )}

        <p className="text-sm text-[#d6d3d1]">
          {phase === 'listen'
            ? 'Listen…'
            : phase === 'say'
              ? micSupported
                ? isMobile
                  ? 'Tap Speak, wait for Listening…, then say it into the phone.'
                  : 'Say it into the mic — watch the tuner!'
                : 'Say it out loud — then tap “I said it”.'
              : hitHint ?? 'Great!'}
        </p>
        {micError && (
          <p className="text-sm font-semibold text-amber-200" role="status">
            {micError}
          </p>
        )}

        <div className="flex flex-col items-stretch justify-center gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={replay}
            className={`${sayItTheme.btnSecondary} min-h-12 px-5 py-3 sm:min-h-0`}
          >
            Hear again
          </button>
          {micSupported && (
            <button
              type="button"
              disabled={checking || phase === 'listen' || listening}
              onClick={() => void listenWithMic()}
              className={`${sayItTheme.btnPrimary} min-h-14 px-8 py-4 text-base sm:min-h-0 ${
                listening ? 'animate-pulse' : ''
              }`}
            >
              {listening ? 'Listening…' : '🎤 Speak'}
            </button>
          )}
          <button
            type="button"
            disabled={checking || phase === 'listen' || listening}
            onClick={saidItHonor}
            className={`${sayItTheme.btnSecondary} min-h-12 px-6 py-3 sm:min-h-0`}
          >
            I said it
          </button>
        </div>
        <p className="text-xs leading-relaxed text-[#a8a29e]">
          {device?.tip ??
            (micSupported
              ? 'Mic checks your words like a tuner. “I said it” always works without a mic.'
              : 'No speech mic here — say it clearly, then tap “I said it”.')}
        </p>
      </section>
    </div>
  )
}
