import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { BLEND_WORD_BASE_PATH } from '@/lib/blend-the-word/constants'
import { getBlendWordById } from '@/lib/blend-the-word/data'
import { awardBlendWordCorrect } from '@/lib/points/service'

export const POST = createCelebrateHandler('blend-the-word', async ({ userId, scope, body }) => {
  const wordId = bodyString(body, 'wordId')
  if (!wordId) return celebrateError('Missing wordId', 400)
  const word = await getBlendWordById(wordId)
  if (!word) return celebrateError('Word not found', 404)
  const result = await awardBlendWordCorrect(userId, word.id, word.word, scope)
  return { result, revalidate: [BLEND_WORD_BASE_PATH] }
})
