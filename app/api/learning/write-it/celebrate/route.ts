import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getWriteItLetterById, getWriteItSentenceById } from '@/lib/write-it/data'
import { WRITE_IT_BASE_PATH } from '@/lib/write-it/constants'
import { awardWriteItCorrect } from '@/lib/points/service'

export const POST = createCelebrateHandler('write-it', async ({ userId, scope, body }) => {
  const kind = bodyString(body, 'kind')
  const itemId = bodyString(body, 'itemId')

  if (kind === 'sentence') {
    const sentence = await getWriteItSentenceById(itemId)
    if (!sentence) return celebrateError('Sentence not found', 404)
    const result = await awardWriteItCorrect(
      userId,
      `sent:${sentence.id}`,
      `Sentence: ${sentence.speak}`,
      scope
    )
    return { result, revalidate: [WRITE_IT_BASE_PATH] }
  }

  if (kind === 'trace') {
    const letter = await getWriteItLetterById(itemId)
    if (!letter) return celebrateError('Letter not found', 404)
    const result = await awardWriteItCorrect(
      userId,
      `trace:${letter.id}`,
      `Trace: ${letter.letter}`,
      scope
    )
    return { result, revalidate: [WRITE_IT_BASE_PATH] }
  }

  return celebrateError('Invalid kind', 400)
})
