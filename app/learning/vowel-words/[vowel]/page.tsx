import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import VowelWordsShell from '@/features/vowel-words/components/VowelWordsShell'
import VowelPlay from '@/features/vowel-words/components/VowelPlay'
import { getVowelById, getWordsByVowelId } from '@/lib/vowel-words/data'
import { auth } from '@/lib/auth-server'
import { getVowelWordsMastery } from '@/lib/points/service'
import { vowelTheme } from '@/features/vowel-words/vowel-theme'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'

type PageProps = {
  params: Promise<{ vowel: string }>
  searchParams: Promise<{ page?: string; mode?: string }>
}

export default async function VowelSessionPage({ params, searchParams }: PageProps) {
  const { vowel: vowelId } = await params
  const { page: pageParam, mode: modeParam } = await searchParams
  const vowel = await getVowelById(vowelId)
  if (!vowel) notFound()

  const words = await getWordsByVowelId(vowelId)
  const initialPage = Math.max(1, Number(pageParam) || 1)
  const initialMode = modeParam === 'play' ? 'play' : 'learn'

  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const mastery = await getVowelWordsMastery(session.user.id)
    masteredKeys = mastery.masteredKeys.filter((key) => key.startsWith(`${vowelId}:`))
  }

  return (
    <VowelWordsShell title={vowel.label} backHref={VOWEL_WORDS_BASE_PATH}>
      {words.length === 0 ? (
        <div className={`${vowelTheme.cardSoft} space-y-2 py-12 text-center`}>
          <p className="text-lg font-extrabold text-violet-950">No words yet</p>
          <p className="text-sm text-violet-800/80">Try another vowel from the hub.</p>
        </div>
      ) : (
        <Suspense
          fallback={
            <p className={`${vowelTheme.cardSoft} py-12 text-center font-semibold text-violet-800`}>
              Loading game…
            </p>
          }
        >
          <VowelPlay
            vowel={vowel}
            words={words}
            masteredKeys={masteredKeys}
            initialPage={initialPage}
            initialMode={initialMode}
          />
        </Suspense>
      )}
    </VowelWordsShell>
  )
}
