/** Single active playback — prevents overlapping Eco Penguin clips. */

let currentAudio: HTMLAudioElement | null = null
let sequenceGeneration = 0
let muted = false

export function setEcoPenguinMuted(next: boolean): void {
  muted = next
  if (next) stopEcoPenguinAudio()
}

export function isEcoPenguinMuted(): boolean {
  return muted
}

function clearCurrentAudio(): void {
  if (!currentAudio) return
  currentAudio.pause()
  currentAudio.currentTime = 0
  currentAudio = null
}

/** Stop any in-progress clip or intro→question sequence. */
export function stopEcoPenguinAudio(): void {
  sequenceGeneration += 1
  clearCurrentAudio()
}

export type EcoPenguinPlayResult = 'played' | 'muted' | 'failed'

export function playEcoPenguinAudio(
  src: string,
  onEnded?: () => void
): EcoPenguinPlayResult {
  stopEcoPenguinAudio()
  if (muted) {
    onEnded?.()
    return 'muted'
  }

  const audio = new Audio(src)
  currentAudio = audio

  const finish = () => {
    if (currentAudio === audio) currentAudio = null
    onEnded?.()
  }

  audio.addEventListener('ended', finish, { once: true })
  void audio.play().then(
    () => undefined,
    () => finish()
  )
  return 'played'
}

/** Play clips one after another (e.g. “Which one?” then the question). */
export function playEcoPenguinSequence(
  urls: string[],
  options?: { onBlocked?: () => void }
): () => void {
  stopEcoPenguinAudio()
  if (muted) {
    options?.onBlocked?.()
    return () => undefined
  }

  const generation = sequenceGeneration
  let index = 0
  let clip: HTMLAudioElement | null = null
  let blockedNotified = false

  const stop = () => {
    if (generation !== sequenceGeneration) return
    sequenceGeneration += 1
    clip?.pause()
    clip = null
    if (currentAudio) clearCurrentAudio()
  }

  const playNext = () => {
    if (generation !== sequenceGeneration) return
    if (index >= urls.length) {
      clip = null
      currentAudio = null
      return
    }

    clip?.pause()
    clip = new Audio(urls[index])
    currentAudio = clip
    index += 1

    clip.addEventListener(
      'ended',
      () => {
        if (generation !== sequenceGeneration) return
        playNext()
      },
      { once: true }
    )
    void clip.play().catch(() => {
      if (generation !== sequenceGeneration) return
      if (!blockedNotified) {
        blockedNotified = true
        options?.onBlocked?.()
      }
      playNext()
    })
  }

  playNext()
  return stop
}
