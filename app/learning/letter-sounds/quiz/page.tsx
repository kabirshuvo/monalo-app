import LetterSoundsShell from '@/features/letter-sounds/components/LetterSoundsShell'
import LetterSoundsQuiz from '@/features/letter-sounds/components/LetterSoundsQuiz'
import { resolveLetterSoundsAsset } from '@/lib/letter-sounds/assets'
import { LETTER_SOUNDS_BASE_PATH } from '@/lib/letter-sounds/constants'
import { getLetterSounds } from '@/lib/letter-sounds/data'
import { computePhonicsProgress } from '@/lib/learning/phonics-progress'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery, getLetterSoundsMastery } from '@/lib/points/service'

export default async function LetterSoundsQuizPage() {
  const all = await getLetterSounds()
  const session = await auth()
  let masteredKeys: string[] = []
  let unlockedGroupIds = computePhonicsProgress([]).unlockedGroupIds
  if (session?.user?.id) {
    const [quizMastery, balloonMastery] = await Promise.all([
      getLetterSoundsMastery(session.user.id),
      getBalloonLettersMastery(session.user.id),
    ])
    masteredKeys = quizMastery.masteredKeys
    unlockedGroupIds = computePhonicsProgress(balloonMastery.masteredKeys).unlockedGroupIds
  }
  const letters = all.filter((letter) =>
    unlockedGroupIds.includes(letter.group as (typeof unlockedGroupIds)[number])
  )

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
