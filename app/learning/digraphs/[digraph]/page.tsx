import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import DigraphsShell from '@/features/digraphs/components/DigraphsShell'
import DigraphPlay from '@/features/digraphs/components/DigraphPlay'
import { getDigraphById, getWordsByDigraphId } from '@/lib/digraphs/data'
import { auth } from '@/lib/auth-server'
import { getDigraphsMastery } from '@/lib/points/service'
import { digraphTheme } from '@/features/digraphs/digraph-theme'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'

type PageProps = {
  params: Promise<{ digraph: string }>
  searchParams: Promise<{ page?: string; mode?: string }>
}

export default async function DigraphSessionPage({ params, searchParams }: PageProps) {
  const { digraph: digraphId } = await params
  const { page: pageParam, mode: modeParam } = await searchParams
  const digraph = await getDigraphById(digraphId)
  if (!digraph) notFound()

  const words = await getWordsByDigraphId(digraphId)
  const initialPage = Math.max(1, Number(pageParam) || 1)
  const initialMode = modeParam === 'play' ? 'play' : 'learn'

  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const mastery = await getDigraphsMastery(session.user.id)
    masteredKeys = mastery.masteredKeys.filter((key) => key.startsWith(`${digraphId}:`))
  }

  return (
    <DigraphsShell title={digraph.label} backHref={DIGRAPHS_BASE_PATH}>
      {words.length === 0 ? (
        <div className={`${digraphTheme.cardSoft} space-y-2 py-12 text-center`}>
          <p className="text-lg font-extrabold text-amber-950">No words yet</p>
          <p className="text-sm text-amber-800/80">Try another digraph from the hub.</p>
        </div>
      ) : (
        <Suspense
          fallback={
            <p className={`${digraphTheme.cardSoft} py-12 text-center font-semibold text-amber-800`}>
              Loading game…
            </p>
          }
        >
          <DigraphPlay
            digraph={digraph}
            words={words}
            masteredKeys={masteredKeys}
            initialPage={initialPage}
            initialMode={initialMode}
          />
        </Suspense>
      )}
    </DigraphsShell>
  )
}
