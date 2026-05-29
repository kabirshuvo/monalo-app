import { NextResponse } from 'next/server'
import { getEcoPenguinCategoryBySlug, getEcoPenguinItemsByCategorySlug } from '@/lib/ecopenguin/data'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const category = await getEcoPenguinCategoryBySlug(slug)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    const items = await getEcoPenguinItemsByCategorySlug(slug)
    return NextResponse.json({ ok: true, category, items })
  } catch (error) {
    console.error('[GET /api/learning/ecopenguin/categories/:slug/items]', error)
    return NextResponse.json({ error: 'Failed to load items' }, { status: 500 })
  }
}
