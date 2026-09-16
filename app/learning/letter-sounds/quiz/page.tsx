import LetterSoundsShell from '@/features/letter-sounds/components/LetterSoundsShell'
import LetterSoundsQuiz from '@/features/letter-sounds/components/LetterSoundsQuiz'
import { resolveLetterSoundsAsset } from '@/lib/letter-sounds/assets'
import { LETTER_SOUNDS_BASE_PATH } from '@/lib/letter-sounds/constants'
import { getLetterSounds } from '@/lib/letter-sounds/data'
import { auth } from '@/lib/auth-server'
import { getLetterSoundsMastery } from '@/lib/points/service'

export default async function LetterSoundsQuizPage() {
  const letters = await getLetterSounds()
  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const mastery = await getLetterSoundsMastery(session.user.id)
    masteredKeys = mastery.masteredKeys
  }

  return (
    <LetterSoundsShell title="Which letter?" backHref={LETTER_SOUNDS_BASE_PATH}>
      <LetterSoundsQuiz
        letters={letters}
        masteredKeys={masteredKeys}
        questionAudio={resolveLetterSoundsAsset('/audio/question.mp3')}
        successAudio={resolveLetterSoundsAsset('/audio/success.mp3')}
        errorAudio={resolveLetterSoundsAsset('/audio/error.mp3')}
      />
    </LetterSoundsShell>
  )
}
