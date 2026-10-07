import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getSightWordById } from '@/lib/sight-words/data'
import { SIGHT_WORDS_BASE_PATH } from '@/lib/sight-words/constants'
import { awardSightWordsCorrect } from '@/lib/points/service'

export const POST = createCelebrateHandler('sight-words', async ({ userId, scope, body }) => {
  const word = await getSightWordById(bodyString(body, 'wordId'))
  if (!word) return celebrateError('Word not found', 404)
  const result = await awardSightWordsCorrect(userId, word.id, word.word, scope)
  return { result, revalidate: [SIGHT_WORDS_BASE_PATH] }
})
