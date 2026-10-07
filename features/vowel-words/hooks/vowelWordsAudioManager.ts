/** Single active playback + speech-synthesis fallback for missing mp3s. */

let currentAudio: HTMLAudioElement | null = null
let sequenceGeneration = 0
let muted = false
let speakToken = 0

export function setVowelWordsMuted(next: boolean): void {
  muted = next
  if (next) stopVowelWordsAudio()
}

export function isVowelWordsMuted(): boolean {
  return muted
}

function clearCurrentAudio(): void {
  if (!currentAudio) return
  currentAudio.pause()
  currentAudio.currentTime = 0
  currentAudio = null
}

export function stopVowelWordsAudio(): void {
  sequenceGeneration += 1
  speakToken += 1
  clearCurrentAudio()
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  return (
    voices.find((v) => v.lang === 'en-US' && /female|samantha|zira|ana|google us/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith('en-US')) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  )
}

/**
 * Browser TTS. Chrome often drops speak() if called immediately after cancel() —
 * delay slightly and resume if the synth is stuck paused.
 */
function speakFallback(text: string, onEnded?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    onEnded?.()
    return
  }

  const token = ++speakToken
  window.speechSynthesis.cancel()

  const run = () => {
    if (token !== speakToken) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    const voice = pickEnglishVoice()
    if (voice) utterance.voice = voice
    utterance.onend = () => {
      if (token === speakToken) onEnded?.()
    }
    utterance.onerror = () => {
      if (token === speakToken) onEnded?.()
    }
    try {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
      window.speechSynthesis.speak(utterance)
      // Some Chrome builds need a kick if the queue stays empty
      window.setTimeout(() => {
        if (token !== speakToken) return
        if (window.speechSynthesis.paused) window.speechSynthesis.resume()
      }, 100)
    } catch {
      onEnded?.()
    }
  }

  // Warm voices on first use (async on many browsers)
  if (!window.speechSynthesis.getVoices().length) {
    const onVoices = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices)
      window.setTimeout(run, 40)
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoices)
    window.setTimeout(run, 120)
    return
  }

  window.setTimeout(run, 40)
}

export function playVowelWordsAudio(
  src: string,
  options?: { fallbackText?: string; onEnded?: () => void; onBlocked?: () => void }
): void {
  stopVowelWordsAudio()
  if (muted) {
    options?.onEnded?.()
    return
  }

  if (!src) {
    if (options?.fallbackText) {
      speakFallback(options.fallbackText, options.onEnded)
    } else {
      options?.onEnded?.()
    }
    return
  }

  const audio = new Audio(src)
  currentAudio = audio
  const finish = () => {
    if (currentAudio === audio) currentAudio = null
    options?.onEnded?.()
  }

  audio.addEventListener('ended', finish, { once: true })
  audio.addEventListener(
    'error',
    () => {
      if (currentAudio === audio) currentAudio = null
      if (options?.fallbackText) {
        speakFallback(options.fallbackText, options.onEnded)
      } else {
        options?.onEnded?.()
      }
    },
    { once: true }
  )
  void audio.play().catch(() => {
    if (currentAudio === audio) currentAudio = null
    options?.onBlocked?.()
    if (options?.fallbackText) {
      speakFallback(options.fallbackText, options.onEnded)
    } else {
      options?.onEnded?.()
    }
  })
}

export function playVowelWordsSequence(
  clips: { src: string; fallbackText?: string }[],
  options?: { onBlocked?: () => void }
): () => void {
  stopVowelWordsAudio()
  if (muted) {
    options?.onBlocked?.()
    return () => undefined
  }

  const generation = sequenceGeneration
  let index = 0

  const stop = () => {
    if (generation !== sequenceGeneration) return
    sequenceGeneration += 1
    speakToken += 1
    clearCurrentAudio()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  const playNext = () => {
    if (generation !== sequenceGeneration) return
    if (index >= clips.length) return
    const clip = clips[index]
    index += 1

    const advance = () => {
      if (generation !== sequenceGeneration) return
      playNext()
    }

    if (!clip.src) {
      if (clip.fallbackText) {
        speakFallback(clip.fallbackText, advance)
      } else {
        advance()
      }
      return
    }

    const audio = new Audio(clip.src)
    currentAudio = audio

    audio.addEventListener('ended', advance, { once: true })
    audio.addEventListener(
      'error',
      () => {
        if (generation !== sequenceGeneration) return
        if (clip.fallbackText) {
          options?.onBlocked?.()
          speakFallback(clip.fallbackText, advance)
        } else {
          options?.onBlocked?.()
          advance()
        }
      },
      { once: true }
    )
    void audio.play().catch(() => {
      if (generation !== sequenceGeneration) return
      if (clip.fallbackText) {
        options?.onBlocked?.()
        speakFallback(clip.fallbackText, advance)
      } else {
        options?.onBlocked?.()
        advance()
      }
    })
  }

  playNext()
  return stop
}
