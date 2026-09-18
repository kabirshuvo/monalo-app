import BalloonLettersPlay from '@/features/balloon-letters/components/BalloonLettersPlay'
import BalloonLettersShell from '@/features/balloon-letters/components/BalloonLettersShell'
import { resolveLetterSoundsAsset } from '@/lib/letter-sounds/assets'
import { getLetterSounds } from '@/lib/letter-sounds/data'
import { computePhonicsProgress } from '@/lib/learning/phonics-progress'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery } from '@/lib/points/service'

export default async function BalloonLettersPage() {
  const all = await getLetterSounds()
  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const mastery = await getBalloonLettersMastery(session.user.id)
    masteredKeys = mastery.masteredKeys
  }
  const progress = computePhonicsProgress(masteredKeys)
  const letters = all.filter((letter) =>
    progress.unlockedGroupIds.includes(letter.group as (typeof progress.unlockedGroupIds)[number])
  )

  return (
    <BalloonLettersShell title="Listen, then tap the balloon">
      <BalloonLettersPlay
        letters={letters}
        masteredKeys={masteredKeys}
        initialGroupId={progress.activeGroupId}
        successAudio={resolveLetterSoundsAsset('/audio/success.mp3')}
        errorAudio={resolveLetterSoundsAsset('/audio/error.mp3')}
      />
    </BalloonLettersShell>
  )
}
