import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getSayItPromptById } from '@/lib/say-it/data'
import { SAY_IT_BASE_PATH } from '@/lib/say-it/constants'
import { awardSayItCorrect } from '@/lib/points/service'

export const POST = createCelebrateHandler('say-it', async ({ userId, scope, body }) => {
  const prompt = await getSayItPromptById(bodyString(body, 'promptId'))
  if (!prompt) return celebrateError('Prompt not found', 404)
  const result = await awardSayItCorrect(userId, prompt.id, prompt.label, scope)
  return { result, revalidate: [SAY_IT_BASE_PATH] }
})
