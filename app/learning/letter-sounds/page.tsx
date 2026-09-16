import LetterSoundsShell from '@/features/letter-sounds/components/LetterSoundsShell'
import LetterSoundsLearn from '@/features/letter-sounds/components/LetterSoundsLearn'
import { getLetterSounds } from '@/lib/letter-sounds/data'

export default async function LetterSoundsPage() {
  const letters = await getLetterSounds()
  return (
    <LetterSoundsShell title="26 letter sounds">
      <LetterSoundsLearn letters={letters} />
    </LetterSoundsShell>
  )
}
