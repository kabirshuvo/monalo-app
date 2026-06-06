import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { getEcoPenguinItemBySlug } from '@/lib/ecopenguin/data'
import { awardEcoPenguinCorrect, getPointsBreakdown } from '@/lib/points/service'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const categorySlug = String(body.categorySlug ?? '').trim()
    const itemSlug = String(body.itemSlug ?? '').trim()

    if (!categorySlug || !itemSlug) {
      return NextResponse.json({ error: 'Missing categorySlug or itemSlug' }, { status: 400 })
    }

    const item = await getEcoPenguinItemBySlug(categorySlug, itemSlug)
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const result = await awardEcoPenguinCorrect(
      session.user.id,
      categorySlug,
      itemSlug,
      item.name
    )
    const breakdown = await getPointsBreakdown(session.user.id)

    return NextResponse.json({
      ok: true,
      awarded: result.awarded,
      points: result.points,
      breakdown,
    })
  } catch (error) {
    console.error('[POST /api/learning/ecopenguin/celebrate]', error)
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 })
  }
}
