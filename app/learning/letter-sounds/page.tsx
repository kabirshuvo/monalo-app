import LetterSoundsShell from '@/features/letter-sounds/components/LetterSoundsShell'
import LetterSoundsLearn from '@/features/letter-sounds/components/LetterSoundsLearn'
import OfflineShell from '@/features/learning/components/OfflineShell'
import { getLetterSounds } from '@/lib/letter-sounds/data'
import { computePhonicsProgress } from '@/lib/learning/phonics-progress'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery } from '@/lib/points/service'

export default async function LetterSoundsPage() {
  const letters = await getLetterSounds()
  const session = await auth()
  let unlockedGroupIds = computePhonicsProgress([]).unlockedGroupIds
  if (session?.user?.id) {
    const mastery = await getBalloonLettersMastery(session.user.id)
    unlockedGroupIds = computePhonicsProgress(mastery.masteredKeys).unlockedGroupIds
  }

  const unlocked = new Set(unlockedGroupIds)
  const pack = letters.filter((l) => unlocked.has(l.group as (typeof unlockedGroupIds)[number]))
  const precacheUrls = pack.flatMap((l) => [l.image, l.audio.sound, l.audio.keyword]).filter(Boolean)

  return (
    <LetterSoundsShell title="26 letter sounds">
      <OfflineShell precacheUrls={precacheUrls} />
      <LetterSoundsLearn letters={letters} unlockedGroupIds={unlockedGroupIds} />
    </LetterSoundsShell>
  )
}
