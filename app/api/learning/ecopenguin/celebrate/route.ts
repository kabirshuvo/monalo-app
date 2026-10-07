import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getEcoPenguinItemBySlug } from '@/lib/ecopenguin/data'
import { awardEcoPenguinCorrect } from '@/lib/points/service'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'

export const POST = createCelebrateHandler('ecopenguin', async ({ userId, scope, body }) => {
  const categorySlug = bodyString(body, 'categorySlug')
  const itemSlug = bodyString(body, 'itemSlug')
  if (!categorySlug || !itemSlug) return celebrateError('Missing categorySlug or itemSlug', 400)
  const item = await getEcoPenguinItemBySlug(categorySlug, itemSlug)
  if (!item) return celebrateError('Item not found', 404)
  const result = await awardEcoPenguinCorrect(userId, categorySlug, itemSlug, item.name, scope)
  return {
    result,
    revalidate: [ECO_PENGUIN_BASE_PATH, `${ECO_PENGUIN_BASE_PATH}/categories/${categorySlug}`],
  }
})
