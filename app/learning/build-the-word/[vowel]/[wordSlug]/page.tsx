import { notFound, redirect } from 'next/navigation'
import { BUILD_WORD_BASE_PATH } from '@/lib/build-word/session'
import { getVowelById } from '@/lib/vowel-words/data'

type PageProps = {
  params: Promise<{ vowel: string; wordSlug: string }>
}

/** Spelling stays on the play screen. Old celebrate URLs go straight back to the next word. */
export default async function BuildWordWordPage({ params }: PageProps) {
  const { vowel: vowelId } = await params
  const vowel = await getVowelById(vowelId)
  if (!vowel) notFound()
  redirect(`${BUILD_WORD_BASE_PATH}/${vowelId}`)
}
