import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'
import { getStoryById } from '@/lib/read-a-story/data'
import { READ_STORY_BASE_PATH } from '@/lib/read-a-story/constants'
import { awardReadStoryComplete } from '@/lib/points/service'

export const POST = createCelebrateHandler('read-a-story', async ({ userId, scope, body }) => {
  const story = await getStoryById(bodyString(body, 'storyId'))
  if (!story) return celebrateError('Story not found', 404)
  const result = await awardReadStoryComplete(userId, story.id, story.title, scope)
  return { result, revalidate: [READ_STORY_BASE_PATH] }
})
