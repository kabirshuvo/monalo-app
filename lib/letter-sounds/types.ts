import type { LetterSoundId } from '@/lib/letter-sounds/constants'

export type LetterSound = {
  id: LetterSoundId
  group: string
  letter: string
  phoneme: string
  keyword: string
  image: string
  speak: {
    sound: string
    keyword: string
  }
  audio: {
    sound: string
    keyword: string
  }
}
