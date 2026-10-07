import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getNurseryRhymeSetById } from '@/lib/nursery-rhyme/data'
import { NURSERY_RHYME_BASE_PATH } from '@/lib/nursery-rhyme/constants'
import { awardNurseryRhymeCorrect } from '@/lib/points/service'

export const POST = createCelebrateHandler('nursery-rhyme', async ({ userId, scope, body }) => {
  const set = await getNurseryRhymeSetById(bodyString(body, 'setId'))
  if (!set) return celebrateError('Rhyme set not found', 404)
  const result = await awardNurseryRhymeCorrect(userId, set.id, set.speak, scope)
  return { result, revalidate: [NURSERY_RHYME_BASE_PATH] }
})
