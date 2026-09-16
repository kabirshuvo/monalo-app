import lettersData from '@/data/letter-sounds/letters.json'
import { resolveLetterSoundsAsset } from '@/lib/letter-sounds/assets'
import { LETTER_SOUND_IDS, type LetterSoundId } from '@/lib/letter-sounds/constants'
import type { LetterSound } from '@/lib/letter-sounds/types'

function mapLetter(letter: LetterSound): LetterSound {
  return {
    ...letter,
    image: resolveLetterSoundsAsset(letter.image),
    audio: {
      sound: resolveLetterSoundsAsset(letter.audio.sound),
      keyword: resolveLetterSoundsAsset(letter.audio.keyword),
    },
  }
}

export function isLetterSoundId(id: string): id is LetterSoundId {
  return (LETTER_SOUND_IDS as readonly string[]).includes(id)
}

export async function getLetterSounds(): Promise<LetterSound[]> {
  return (lettersData as LetterSound[]).map(mapLetter)
}

export async function getLetterSoundById(id: string): Promise<LetterSound | null> {
  if (!isLetterSoundId(id)) return null
  const letters = await getLetterSounds()
  return letters.find((letter) => letter.id === id) ?? null
}
