/** Reuse vowel-words speech+audio manager pattern locally for digraphs. */
let currentAudio: HTMLAudioElement | null = null
let sequenceGeneration = 0
let muted = false

export function setDigraphsMuted(next: boolean): void {
  muted = next
  if (next) stopDigraphsAudio()
}

export function stopDigraphsAudio(): void {
  sequenceGeneration += 1
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

function speak(text: string, onEnded?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    onEnded?.()
    return
  }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.9
  u.onend = () => onEnded?.()
  u.onerror = () => onEnded?.()
  window.speechSynthesis.speak(u)
}

export function playDigraphsAudio(
  src: string,
  options?: { fallbackText?: string; onEnded?: () => void }
): void {
  stopDigraphsAudio()
  if (muted) {
    options?.onEnded?.()
    return
  }
  if (!src) {
    if (options?.fallbackText) speak(options.fallbackText, options.onEnded)
    else options?.onEnded?.()
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
    if (options?.fallbackText) speak(options.fallbackText, options.onEnded)
    else options?.onEnded?.()
  })
}

export function playDigraphsSequence(
  clips: { src: string; fallbackText?: string }[],
  options?: { onBlocked?: () => void }
): () => void {
  stopDigraphsAudio()
  if (muted) {
    options?.onBlocked?.()
    return () => undefined
  }
  const generation = sequenceGeneration
  let index = 0
  const stop = () => {
    if (generation !== sequenceGeneration) return
    sequenceGeneration += 1
    currentAudio = null
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }
  const playNext = () => {
    if (generation !== sequenceGeneration) return
    if (index >= clips.length) return
    const clip = clips[index++]
    const advance = () => {
      if (generation !== sequenceGeneration) return
      playNext()
    }
    if (!clip.src) {
      if (clip.fallbackText) speak(clip.fallbackText, advance)
      else advance()
      return
    }
    const audio = new Audio(clip.src)
    currentAudio = audio
    audio.addEventListener('ended', advance, { once: true })
    void audio.play().catch(() => {
      if (generation !== sequenceGeneration) return
      options?.onBlocked?.()
      if (clip.fallbackText) speak(clip.fallbackText, advance)
      else advance()
    })
  }
  playNext()
  return stop
}
