/** Single active playback + speech-synthesis fallback for missing mp3s. */

let currentAudio: HTMLAudioElement | null = null
let sequenceGeneration = 0
let muted = false

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
  clearCurrentAudio()
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

function speakFallback(text: string, onEnded?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    onEnded?.()
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.9
  utterance.onend = () => onEnded?.()
  utterance.onerror = () => onEnded?.()
  window.speechSynthesis.speak(utterance)
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
