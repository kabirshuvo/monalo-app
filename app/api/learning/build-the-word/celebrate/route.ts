import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getWordBySlug } from '@/lib/vowel-words/data'
import { awardBuildWordCorrect } from '@/lib/points/service'
import { BUILD_WORD_BASE_PATH } from '@/lib/build-word/session'

export const POST = createCelebrateHandler('build-the-word', async ({ userId, scope, body }) => {
  const vowelId = bodyString(body, 'vowelId')
  const wordSlug = bodyString(body, 'wordSlug')
  if (!vowelId || !wordSlug) return celebrateError('Missing vowelId or wordSlug', 400)
  const word = await getWordBySlug(vowelId, wordSlug)
  if (!word) return celebrateError('Word not found', 404)
  const result = await awardBuildWordCorrect(userId, vowelId, wordSlug, word.word, scope)
  return { result, revalidate: [BUILD_WORD_BASE_PATH, `${BUILD_WORD_BASE_PATH}/${vowelId}`] }
})
