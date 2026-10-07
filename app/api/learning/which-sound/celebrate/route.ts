import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getLetterSoundById } from '@/lib/letter-sounds/data'
import { WHICH_SOUND_BASE_PATH } from '@/lib/which-sound/constants'
import { awardWhichSoundCorrect } from '@/lib/points/service'

export const POST = createCelebrateHandler('which-sound', async ({ userId, scope, body }) => {
  const letter = await getLetterSoundById(bodyString(body, 'letterId'))
  if (!letter) return celebrateError('Letter not found', 404)
  const result = await awardWhichSoundCorrect(userId, letter.id, letter.letter, scope)
  return { result, revalidate: [WHICH_SOUND_BASE_PATH] }
})
