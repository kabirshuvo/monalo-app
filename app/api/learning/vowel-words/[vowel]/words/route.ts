import { NextResponse } from 'next/server'
import { getVowelById, getWordsByVowelId } from '@/lib/vowel-words/data'

type Ctx = { params: Promise<{ vowel: string }> }

export async function GET(_request: Request, context: Ctx) {
  try {
    const { vowel: vowelId } = await context.params
    const vowel = await getVowelById(vowelId)
    if (!vowel) {
      return NextResponse.json({ error: 'Vowel not found' }, { status: 404 })
    }
    const words = await getWordsByVowelId(vowelId)
    return NextResponse.json({ ok: true, vowel, words })
  } catch (error) {
    console.error('[GET /api/learning/vowel-words/[vowel]/words]', error)
    return NextResponse.json({ error: 'Failed to load words' }, { status: 500 })
  }
}
