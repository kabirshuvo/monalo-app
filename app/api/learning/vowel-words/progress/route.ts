import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { getVowels, getWordsByVowelId } from '@/lib/vowel-words/data'
import { getVowelWordsMastery } from '@/lib/points/service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [mastery, vowels] = await Promise.all([
      getVowelWordsMastery(session.user.id),
      getVowels(),
    ])

    const categories = await Promise.all(
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

    return NextResponse.json({
      ok: true,
      masteredKeys: mastery.masteredKeys,
      vowels: categories,
    })
  } catch (error) {
    console.error('[GET /api/learning/vowel-words/progress]', error)
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })
  }
}
