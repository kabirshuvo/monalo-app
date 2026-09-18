import storiesData from '@/data/read-a-story/stories.json'
import { computePhonicsProgress, type PhonicsGroupId } from '@/lib/learning/phonics-progress'
import type { DecodableStory } from '@/lib/read-a-story/types'

export async function getDecodableStories(): Promise<DecodableStory[]> {
  return storiesData as DecodableStory[]
}

export async function getUnlockedStories(masteredBalloonKeys: string[]): Promise<DecodableStory[]> {
  const progress = computePhonicsProgress(masteredBalloonKeys)
  const unlocked = new Set(progress.unlockedGroupIds)
  const all = await getDecodableStories()
  return all.filter((story) => unlocked.has(story.requiredGroup as PhonicsGroupId))
}

export async function getStoryById(id: string): Promise<DecodableStory | null> {
  const all = await getDecodableStories()
  return all.find((s) => s.id === id) ?? null
}
