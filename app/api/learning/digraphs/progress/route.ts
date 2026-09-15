import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { getDigraphs, getWordsByDigraphId } from '@/lib/digraphs/data'
import { getDigraphsMastery } from '@/lib/points/service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [mastery, digraphs] = await Promise.all([
      getDigraphsMastery(session.user.id),
      getDigraphs(),
    ])

    const categories = await Promise.all(
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

    return NextResponse.json({
      ok: true,
      masteredKeys: mastery.masteredKeys,
      digraphs: categories,
    })
  } catch (error) {
    console.error('[GET /api/learning/digraphs/progress]', error)
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })
  }
}
