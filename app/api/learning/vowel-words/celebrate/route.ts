import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getWordBySlug } from '@/lib/vowel-words/data'
import { awardVowelWordsCorrect } from '@/lib/points/service'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'

export const POST = createCelebrateHandler('vowel-words', async ({ userId, scope, body }) => {
  const vowelId = bodyString(body, 'vowelId')
  const wordSlug = bodyString(body, 'wordSlug')
  if (!vowelId || !wordSlug) return celebrateError('Missing vowelId or wordSlug', 400)
  const word = await getWordBySlug(vowelId, wordSlug)
  if (!word) return celebrateError('Word not found', 404)
  const result = await awardVowelWordsCorrect(userId, vowelId, wordSlug, word.word, scope)
  return { result, revalidate: [VOWEL_WORDS_BASE_PATH, `${VOWEL_WORDS_BASE_PATH}/${vowelId}`] }
})
