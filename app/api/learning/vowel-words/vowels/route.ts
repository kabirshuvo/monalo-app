import { NextResponse } from 'next/server'
import { getVowels } from '@/lib/vowel-words/data'

export async function GET() {
  try {
    const vowels = await getVowels()
    return NextResponse.json({ ok: true, vowels })
  } catch (error) {
    console.error('[GET /api/learning/vowel-words/vowels]', error)
    return NextResponse.json({ error: 'Failed to load vowels' }, { status: 500 })
  }
}
