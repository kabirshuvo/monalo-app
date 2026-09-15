import DigraphsShell from '@/features/digraphs/components/DigraphsShell'
import DigraphsHub from '@/features/digraphs/components/DigraphsHub'
import { getDigraphs, getWordsByDigraphId } from '@/lib/digraphs/data'
import { auth } from '@/lib/auth-server'
import { getDigraphsMastery } from '@/lib/points/service'

export default async function DigraphsHomePage() {
  const digraphs = await getDigraphs()
  const session = await auth()

  let progress: { id: string; label: string; total: number; mastered: number }[] = []

  if (session?.user?.id) {
    const mastery = await getDigraphsMastery(session.user.id)
    progress = await Promise.all(
      digraphs.map(async (digraph) => {
        const words = await getWordsByDigraphId(digraph.id)
        return {
          id: digraph.id,
          label: digraph.label,
          total: words.length,
          mastered: Math.min(mastery.byDigraph[digraph.id] ?? 0, words.length),
        }
      })
    )
  }

  return (
    <DigraphsShell>
      <DigraphsHub digraphs={digraphs} progress={progress} />
    </DigraphsShell>
  )
}
