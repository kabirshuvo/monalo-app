import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getConsonantBlendWordById } from '@/lib/consonant-blends/data'
import { CONSONANT_BLENDS_BASE_PATH } from '@/lib/consonant-blends/constants'
import { awardConsonantBlendsCorrect } from '@/lib/points/service'

export const POST = createCelebrateHandler('consonant-blends', async ({ userId, scope, body }) => {
  const word = await getConsonantBlendWordById(bodyString(body, 'wordId'))
  if (!word) return celebrateError('Word not found', 404)
  const result = await awardConsonantBlendsCorrect(userId, word.id, word.word, scope)
  return { result, revalidate: [CONSONANT_BLENDS_BASE_PATH] }
})
