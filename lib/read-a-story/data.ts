import storiesData from '@/data/read-a-story/stories.json'
import { computePhonicsProgress, type PhonicsGroupId } from '@/lib/learning/phonics-progress'
import type { DecodableStory } from '@/lib/read-a-story/types'

export async function getDecodableStories(): Promise<DecodableStory[]> {
  return storiesData as DecodableStory[]
}

/** Stories unlock only after the matching balloon group sticker is earned. */
export async function getUnlockedStories(masteredBalloonKeys: string[]): Promise<DecodableStory[]> {
  const progress = computePhonicsProgress(masteredBalloonKeys)
  const completed = new Set(progress.completedGroupIds)
  const all = await getDecodableStories()
  return all.filter((story) => completed.has(story.requiredGroup as PhonicsGroupId))
}

export async function getStoryById(id: string): Promise<DecodableStory | null> {
  const all = await getDecodableStories()
  return all.find((s) => s.id === id) ?? null
}
