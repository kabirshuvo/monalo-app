import { notFound } from 'next/navigation'
import DigraphsShell from '@/features/digraphs/components/DigraphsShell'
import WordCelebrate from '@/features/digraphs/components/WordCelebrate'
import { getDigraphById, getDigraphWordBySlug } from '@/lib/digraphs/data'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'

type PageProps = {
  params: Promise<{ digraph: string; wordSlug: string }>
  searchParams: Promise<{ celebrate?: string; page?: string }>
}

export default async function DigraphWordPage({ params, searchParams }: PageProps) {
  const { digraph: digraphId, wordSlug } = await params
  const { celebrate, page } = await searchParams

  const digraph = await getDigraphById(digraphId)
  if (!digraph) notFound()

  const word = await getDigraphWordBySlug(digraphId, wordSlug)
  if (!word) notFound()

  const resumePage = Math.max(1, Number(page) || 1)

  return (
    <DigraphsShell
      title={word.word}
      backHref={`${DIGRAPHS_BASE_PATH}/${digraphId}?page=${resumePage}&mode=play`}
    >
      <WordCelebrate
        digraph={digraph}
        word={word}
        showConfetti={celebrate === '1'}
        resumePage={resumePage}
      />
    </DigraphsShell>
  )
}
