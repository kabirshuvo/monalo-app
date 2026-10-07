'use client'

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<{
    0: { transcript: string; confidence: number }
    isFinal?: boolean
    length: number
  }>
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

export type SpeechDeviceInfo = {
  supported: boolean
  secureContext: boolean
  isMobile: boolean
  isIos: boolean
  isAndroid: boolean
  /** Short tip for parents when mic is weak/unsupported */
  tip: string
}

function ua(): string {
  if (typeof navigator === 'undefined') return ''
  return navigator.userAgent || ''
}

export function getSpeechDeviceInfo(): SpeechDeviceInfo {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      secureContext: false,
      isMobile: false,
      isIos: false,
      isAndroid: false,
      tip: 'Use “I said it” if the mic is unavailable.',
    }
  }

  const agent = ua()
  const isIos = /iPhone|iPad|iPod/i.test(agent)
  const isAndroid = /Android/i.test(agent)
  const isMobile =
    isIos ||
    isAndroid ||
    /Mobile/i.test(agent) ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1 && window.innerWidth < 900)

  const w = window as SpeechWindow
  const hasApi = Boolean(w.SpeechRecognition || w.webkitSpeechRecognition)
  const secureContext = window.isSecureContext === true
  const supported = hasApi && secureContext

  let tip =
    'Mic works best on Chrome. “I said it” always works if the mic is busy.'
  if (!secureContext) {
    tip = 'Mic needs a secure (https) link. Use “I said it” for now.'
  } else if (!hasApi) {
    tip = 'This browser has no speech mic (try Chrome). Use “I said it” instead.'
  } else if (isIos) {
    tip =
      'On iPhone: allow Microphone when asked, speak after the beep-ready “Listening…”. Safari works; Chrome on iOS is similar.'
  } else if (isAndroid) {
    tip = 'On Android: Chrome works best. Allow Microphone, then speak clearly near the phone.'
  }

  return { supported, secureContext, isMobile, isIos, isAndroid, tip }
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechDeviceInfo().supported
}

export type ListenResult = {
  transcript: string
  confidence: number
}

/** Ask for mic permission early (helps Android permission sheet). Safe to ignore failures. */
export async function ensureMicPermission(): Promise<'granted' | 'denied' | 'unavailable'> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return 'unavailable'
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    })
    for (const track of stream.getTracks()) track.stop()
    return 'granted'
  } catch {
    return 'denied'
  }
}

/**
 * One-shot listen tuned for phones.
 * - Must be called from a user tap (required on iOS)
 * - Stops overlapping TTS before start (caller should cancel speechSynthesis)
 * - Uses interim results on iOS so we still get text if final never fires
 */
export function listenOnce(options?: {
  lang?: string
  timeoutMs?: number
  /** Prefer longer window on phones */
  mobile?: boolean
  ios?: boolean
}): Promise<ListenResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('unsupported'))
      return
    }
    if (!window.isSecureContext) {
      reject(new Error('insecure'))
      return
    }

    const w = window as SpeechWindow
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) {
      reject(new Error('unsupported'))
      return
    }

    const recognition = new Ctor()
    const ios = options?.ios ?? /iPhone|iPad|iPod/i.test(ua())
    const mobile = options?.mobile ?? true

    recognition.lang = options?.lang ?? 'en-US'
    recognition.continuous = false
    // iOS often fails to emit a final result; interim helps us capture speech
    recognition.interimResults = ios
    recognition.maxAlternatives = 3

    let settled = false
    let best = ''
    let bestConfidence = 0

    const timeoutMs =
      options?.timeoutMs ?? (mobile ? (ios ? 10000 : 8500) : 6500)

    const finish = (ok: boolean, err?: string) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      try {
        recognition.abort()
      } catch {
        // ignore
      }
      if (ok && best.trim()) {
        resolve({ transcript: best.trim(), confidence: bestConfidence || 0.5 })
        return
      }
      reject(new Error(err || 'empty'))
    }

    const timer = window.setTimeout(() => {
      if (best.trim()) finish(true)
      else finish(false, 'timeout')
    }, timeoutMs)

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const row = event.results[i]
        const alt = row?.[0]
        if (!alt?.transcript) continue
        const text = alt.transcript.trim()
        if (!text) continue
        // Prefer longer / final transcripts
        if (text.length >= best.length) {
          best = text
          bestConfidence = typeof alt.confidence === 'number' ? alt.confidence : bestConfidence
        }
        if (row.isFinal) {
          finish(true)
          return
        }
      }
    }

    recognition.onerror = (event) => {
      const code = event.error || 'error'
      // If we already heard something useful, keep it
      if (best.trim() && (code === 'no-speech' || code === 'aborted')) {
        finish(true)
        return
      }
      finish(false, code)
    }

    recognition.onend = () => {
      if (best.trim()) finish(true)
      else finish(false, 'ended')
    }

    // Brief pause so TTS / audio route releases the mic on phones
    const startDelay = mobile ? 280 : 0
    window.setTimeout(() => {
      if (settled) return
      try {
        recognition.start()
      } catch {
        finish(false, 'start-failed')
      }
    }, startDelay)
  })
}
