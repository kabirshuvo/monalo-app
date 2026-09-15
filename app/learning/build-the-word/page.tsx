import BuildWordShell from '@/features/build-word/components/BuildWordShell'
import BuildWordHub from '@/features/build-word/components/BuildWordHub'
import { getVowels, getWordsByVowelId } from '@/lib/vowel-words/data'
import { auth } from '@/lib/auth-server'
import { getBuildWordMastery } from '@/lib/points/service'

export default async function BuildWordHomePage() {
  const vowels = await getVowels()
  const session = await auth()
  let progress: { id: string; total: number; mastered: number }[] = []
  if (session?.user?.id) {
    const mastery = await getBuildWordMastery(session.user.id)
    progress = await Promise.all(
      vowels.map(async (v) => {
        const words = await getWordsByVowelId(v.id)
        return {
          id: v.id,
          total: words.length,
          mastered: Math.min(mastery.byVowel[v.id] ?? 0, words.length),
        }
      })
    )
  }
  return (
    <BuildWordShell backHref="/learning">
      <BuildWordHub vowels={vowels} progress={progress} />
    </BuildWordShell>
  )
}
