import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getBlendWordById } from '@/lib/blend-the-word/data'
import { SEGMENT_WORD_BASE_PATH } from '@/lib/segment-the-word/constants'
import { awardSegmentWordCorrect } from '@/lib/points/service'

export const POST = createCelebrateHandler('segment-the-word', async ({ userId, scope, body }) => {
  const word = await getBlendWordById(bodyString(body, 'wordId'))
  if (!word) return celebrateError('Word not found', 404)
  const result = await awardSegmentWordCorrect(userId, word.id, word.word, scope)
  return { result, revalidate: [SEGMENT_WORD_BASE_PATH] }
})
