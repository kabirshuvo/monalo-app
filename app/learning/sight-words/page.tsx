import SightWordsPlay from '@/features/sight-words/components/SightWordsPlay'
import SightWordsShell from '@/features/sight-words/components/SightWordsShell'
import { getSightSentences, getSightWords } from '@/lib/sight-words/data'
import { computePhonicsProgress } from '@/lib/learning/phonics-progress'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery, getSightWordsMastery } from '@/lib/points/service'

export default async function SightWordsPage() {
  const [words, sentences] = await Promise.all([getSightWords(), getSightSentences()])
  const session = await auth()
  let masteredKeys: string[] = []
  let locked = true
  if (session?.user?.id) {
    const [sight, balloons] = await Promise.all([
      getSightWordsMastery(session.user.id),
      getBalloonLettersMastery(session.user.id),
    ])
    masteredKeys = sight.masteredKeys
    locked = !computePhonicsProgress(balloons.masteredKeys).completedGroupIds.includes('satpin')
  }

  return (
    <SightWordsShell title="Hear the word. Tap it — or read a sentence.">
      <SightWordsPlay
        words={words}
        sentences={sentences}
        masteredKeys={masteredKeys}
        locked={locked}
      />
    </SightWordsShell>
  )
}
