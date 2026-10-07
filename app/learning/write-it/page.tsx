import WriteItPlay from '@/features/write-it/components/WriteItPlay'
import WriteItShell from '@/features/write-it/components/WriteItShell'
import { getWriteItLetters, getWriteItSentences } from '@/lib/write-it/data'
import { computePhonicsProgress } from '@/lib/learning/phonics-progress'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery, getWriteItMastery } from '@/lib/points/service'

export default async function WriteItPage() {
  const [sentences, letters] = await Promise.all([getWriteItSentences(), getWriteItLetters()])
  const session = await auth()
  let masteredKeys: string[] = []
  let locked = true
  if (session?.user?.id) {
    const [write, balloons] = await Promise.all([
      getWriteItMastery(session.user.id),
      getBalloonLettersMastery(session.user.id),
    ])
    masteredKeys = write.masteredKeys
    locked = !computePhonicsProgress(balloons.masteredKeys).completedGroupIds.includes('satpin')
  }

  return (
    <WriteItShell title="Build a sentence — or finger-trace a letter.">
      <WriteItPlay
        sentences={sentences}
        letters={letters}
        masteredKeys={masteredKeys}
        locked={locked}
      />
    </WriteItShell>
  )
}
