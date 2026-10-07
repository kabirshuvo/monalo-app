import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getDigraphWordBySlug } from '@/lib/digraphs/data'
import { awardDigraphsCorrect } from '@/lib/points/service'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'

export const POST = createCelebrateHandler('digraphs', async ({ userId, scope, body }) => {
  const digraphId = bodyString(body, 'digraphId')
  const wordSlug = bodyString(body, 'wordSlug')
  if (!digraphId || !wordSlug) return celebrateError('Missing digraphId or wordSlug', 400)
  const word = await getDigraphWordBySlug(digraphId, wordSlug)
  if (!word) return celebrateError('Word not found', 404)
  const result = await awardDigraphsCorrect(userId, digraphId, wordSlug, word.word, scope)
  return { result, revalidate: [DIGRAPHS_BASE_PATH, `${DIGRAPHS_BASE_PATH}/${digraphId}`] }
})
