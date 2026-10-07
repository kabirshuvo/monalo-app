import ConsonantBlendsPlay from '@/features/consonant-blends/components/ConsonantBlendsPlay'
import ConsonantBlendsShell from '@/features/consonant-blends/components/ConsonantBlendsShell'
import OfflineShell from '@/features/learning/components/OfflineShell'
import { filterUnlockedBlendWords } from '@/lib/consonant-blends/constants'
import { getConsonantBlendWords } from '@/lib/consonant-blends/data'
import { computePhonicsProgress } from '@/lib/learning/phonics-progress'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery, getConsonantBlendsMastery } from '@/lib/points/service'

export default async function ConsonantBlendsPage() {
  const allWords = await getConsonantBlendWords()
  const session = await auth()
  let masteredKeys: string[] = []
  let locked = true
  if (session?.user?.id) {
    const [blends, balloons] = await Promise.all([
      getConsonantBlendsMastery(session.user.id),
      getBalloonLettersMastery(session.user.id),
    ])
    masteredKeys = blends.masteredKeys
    const progress = computePhonicsProgress(balloons.masteredKeys)
    locked = !progress.completedGroupIds.includes('mdgock')
  }

  const words = filterUnlockedBlendWords(allWords, masteredKeys)
  const precacheUrls = words
    .flatMap((w) => [w.image, w.audio.blend, w.audio.word])
    .filter(Boolean)

  return (
    <ConsonantBlendsShell title="Hear the blend. Tap the picture.">
      <OfflineShell precacheUrls={precacheUrls} />
      <ConsonantBlendsPlay words={words} masteredKeys={masteredKeys} locked={locked} />
    </ConsonantBlendsShell>
  )
}
