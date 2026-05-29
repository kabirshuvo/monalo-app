import { NextResponse } from 'next/server'
import { getEcoPenguinCategories } from '@/lib/ecopenguin/data'

export async function GET() {
  try {
    const categories = await getEcoPenguinCategories()
    return NextResponse.json({ ok: true, categories })
  } catch (error) {
    console.error('[GET /api/learning/ecopenguin/categories]', error)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}
