import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getLetterSoundById } from '@/lib/letter-sounds/data'
import { LETTER_SOUNDS_BASE_PATH, LETTER_SOUNDS_QUIZ_PATH } from '@/lib/letter-sounds/constants'
import { awardLetterSoundsCorrect } from '@/lib/points/service'

export const POST = createCelebrateHandler(
  'letter-sounds',
  async ({ userId, scope, body }) => {
    const letterId = bodyString(body, 'letterId')
    if (!letterId) return celebrateError('Missing letterId', 400)
    const letter = await getLetterSoundById(letterId)
    if (!letter) return celebrateError('Letter not found', 404)
    const result = await awardLetterSoundsCorrect(userId, letter.id, letter.keyword, scope)
    return { result, revalidate: [LETTER_SOUNDS_BASE_PATH, LETTER_SOUNDS_QUIZ_PATH] }
  },
  { allowGuest: true }
)
