import ReadStoryPlay from '@/features/read-a-story/components/ReadStoryPlay'
import ReadStoryShell from '@/features/read-a-story/components/ReadStoryShell'
import { getUnlockedStories } from '@/lib/read-a-story/data'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery, getReadStoryMastery } from '@/lib/points/service'

export default async function ReadStoryPage() {
  const session = await auth()
  let masteredBalloonKeys: string[] = []
  let completedIds: string[] = []
  if (session?.user?.id) {
    const [balloons, stories] = await Promise.all([
      getBalloonLettersMastery(session.user.id),
      getReadStoryMastery(session.user.id),
    ])
    masteredBalloonKeys = balloons.masteredKeys
    completedIds = stories.completedIds
  }
  const unlocked = await getUnlockedStories(masteredBalloonKeys)

  return (
    <ReadStoryShell title="Tap a word to hear it">
      <ReadStoryPlay stories={unlocked} completedIds={completedIds} />
    </ReadStoryShell>
  )
}
