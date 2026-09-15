import { notFound } from 'next/navigation'
import BuildWordShell from '@/features/build-word/components/BuildWordShell'
import BuildWordCelebrate from '@/features/build-word/components/BuildWordCelebrate'
import { getVowelById, getWordBySlug } from '@/lib/vowel-words/data'
import { BUILD_WORD_BASE_PATH } from '@/lib/build-word/session'

type PageProps = {
  params: Promise<{ vowel: string; wordSlug: string }>
  searchParams: Promise<{ celebrate?: string }>
}

export default async function BuildWordCelebratePage({ params, searchParams }: PageProps) {
  const { vowel: vowelId, wordSlug } = await params
  const { celebrate } = await searchParams
  const vowel = await getVowelById(vowelId)
  if (!vowel) notFound()
  const word = await getWordBySlug(vowelId, wordSlug)
  if (!word) notFound()
  return (
    <BuildWordShell
      title={word.word}
      backHref={`${BUILD_WORD_BASE_PATH}/${vowelId}`}
    >
      <BuildWordCelebrate vowel={vowel} word={word} showConfetti={celebrate === '1'} />
    </BuildWordShell>
  )
}
