import WhichSoundPlay from '@/features/which-sound/components/WhichSoundPlay'
import WhichSoundShell from '@/features/which-sound/components/WhichSoundShell'
import { resolveLetterSoundsAsset } from '@/lib/letter-sounds/assets'
import { getLetterSounds } from '@/lib/letter-sounds/data'
import { computePhonicsProgress } from '@/lib/learning/phonics-progress'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery, getWhichSoundMastery } from '@/lib/points/service'

export default async function WhichSoundPage() {
  const all = await getLetterSounds()
  const session = await auth()
  let masteredKeys: string[] = []
  let unlocked = computePhonicsProgress([]).unlockedGroupIds
  if (session?.user?.id) {
    const [which, balloons] = await Promise.all([
      getWhichSoundMastery(session.user.id),
      getBalloonLettersMastery(session.user.id),
    ])
    masteredKeys = which.masteredKeys
    unlocked = computePhonicsProgress(balloons.masteredKeys).unlockedGroupIds
  }
  const unlockedGroups = new Set(unlocked)
  const letters = all.filter((l) => unlockedGroups.has(l.group as (typeof unlocked)[number]))

  return (
    <WhichSoundShell title="Which picture starts with that sound?">
      <WhichSoundPlay
        letters={letters}
        masteredKeys={masteredKeys}
        successAudio={resolveLetterSoundsAsset('/audio/success.mp3')}
        errorAudio={resolveLetterSoundsAsset('/audio/error.mp3')}
      />
    </WhichSoundShell>
  )
}
