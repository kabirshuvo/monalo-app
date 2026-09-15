import { notFound } from 'next/navigation'
import VowelWordsShell from '@/features/vowel-words/components/VowelWordsShell'
import WordCelebrate from '@/features/vowel-words/components/WordCelebrate'
import { getVowelById, getWordBySlug } from '@/lib/vowel-words/data'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'

type PageProps = {
  params: Promise<{ vowel: string; wordSlug: string }>
  searchParams: Promise<{ celebrate?: string; page?: string }>
}

export default async function VowelWordPage({ params, searchParams }: PageProps) {
  const { vowel: vowelId, wordSlug } = await params
  const { celebrate, page } = await searchParams

  const vowel = await getVowelById(vowelId)
  if (!vowel) notFound()

  const word = await getWordBySlug(vowelId, wordSlug)
  if (!word) notFound()

  const resumePage = Math.max(1, Number(page) || 1)

  return (
    <VowelWordsShell
      title={word.word}
      backHref={`${VOWEL_WORDS_BASE_PATH}/${vowelId}?page=${resumePage}&mode=play`}
    >
      <WordCelebrate
        vowel={vowel}
        word={word}
        showConfetti={celebrate === '1'}
        resumePage={resumePage}
      />
    </VowelWordsShell>
  )
}
