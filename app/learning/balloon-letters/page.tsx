import BalloonLettersPlay from '@/features/balloon-letters/components/BalloonLettersPlay'
import BalloonLettersShell from '@/features/balloon-letters/components/BalloonLettersShell'
import { BALLOON_LETTER_IDS } from '@/lib/balloon-letters/constants'
import { resolveLetterSoundsAsset } from '@/lib/letter-sounds/assets'
import { getLetterSounds } from '@/lib/letter-sounds/data'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery } from '@/lib/points/service'

export default async function BalloonLettersPage() {
  const all = await getLetterSounds()
  const letters = all.filter((letter) =>
    (BALLOON_LETTER_IDS as readonly string[]).includes(letter.id)
  )
  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const mastery = await getBalloonLettersMastery(session.user.id)
    masteredKeys = mastery.masteredKeys
  }

  return (
    <BalloonLettersShell title="Listen, then tap the balloon">
      <BalloonLettersPlay
        letters={letters}
        masteredKeys={masteredKeys}
        successAudio={resolveLetterSoundsAsset('/audio/success.mp3')}
        errorAudio={resolveLetterSoundsAsset('/audio/error.mp3')}
      />
    </BalloonLettersShell>
  )
}
