import VowelWordsShell from '@/features/vowel-words/components/VowelWordsShell'
import VowelWordsHub from '@/features/vowel-words/components/VowelWordsHub'
import { getVowels, getWordsByVowelId } from '@/lib/vowel-words/data'
import { auth } from '@/lib/auth-server'
import { getVowelWordsMastery } from '@/lib/points/service'

export default async function VowelWordsHomePage() {
  const vowels = await getVowels()
  const session = await auth()

  let progress: { id: string; label: string; total: number; mastered: number }[] = []

  if (session?.user?.id) {
    const mastery = await getVowelWordsMastery(session.user.id)
    progress = await Promise.all(
      vowels.map(async (vowel) => {
        const words = await getWordsByVowelId(vowel.id)
        return {
          id: vowel.id,
          label: vowel.label,
          total: words.length,
          mastered: Math.min(mastery.byVowel[vowel.id] ?? 0, words.length),
        }
      })
    )
  }

  return (
    <VowelWordsShell>
      <VowelWordsHub vowels={vowels} progress={progress} />
    </VowelWordsShell>
  )
}
