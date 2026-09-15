import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { getEcoPenguinCategories, getEcoPenguinItemsByCategorySlug } from '@/lib/ecopenguin/data'
import { getEcoPenguinMastery } from '@/lib/points/service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [mastery, categories] = await Promise.all([
      getEcoPenguinMastery(session.user.id),
      getEcoPenguinCategories(),
    ])

    const categoryProgress = await Promise.all(
      categories.map(async (category) => {
        const items = await getEcoPenguinItemsByCategorySlug(category.slug)
        const mastered = mastery.byCategory[category.slug] ?? 0
        return {
          slug: category.slug,
          name: category.name,
          total: items.length,
          mastered: Math.min(mastered, items.length),
        }
      })
    )

    return NextResponse.json({
      ok: true,
      masteredKeys: mastery.masteredKeys,
      categories: categoryProgress,
    })
  } catch (error) {
    console.error('[GET /api/learning/ecopenguin/progress]', error)
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })
  }
}
