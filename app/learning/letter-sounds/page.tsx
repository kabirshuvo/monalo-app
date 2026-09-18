import LetterSoundsShell from '@/features/letter-sounds/components/LetterSoundsShell'
import LetterSoundsLearn from '@/features/letter-sounds/components/LetterSoundsLearn'
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

  return (
    <LetterSoundsShell title="26 letter sounds">
      <LetterSoundsLearn letters={letters} unlockedGroupIds={unlockedGroupIds} />
    </LetterSoundsShell>
  )
}
