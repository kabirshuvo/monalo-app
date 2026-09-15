import { notFound } from 'next/navigation'
import BuildWordShell from '@/features/build-word/components/BuildWordShell'
import BuildWordPlay from '@/features/build-word/components/BuildWordPlay'
import { getVowelById, getWordsByVowelId } from '@/lib/vowel-words/data'
import { auth } from '@/lib/auth-server'
import { getBuildWordMastery } from '@/lib/points/service'
import { BUILD_WORD_BASE_PATH } from '@/lib/build-word/session'

type PageProps = { params: Promise<{ vowel: string }> }

export default async function BuildWordVowelPage({ params }: PageProps) {
  const { vowel: vowelId } = await params
  const vowel = await getVowelById(vowelId)
  if (!vowel) notFound()
  const words = await getWordsByVowelId(vowelId)
  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const mastery = await getBuildWordMastery(session.user.id)
    masteredKeys = mastery.masteredKeys.filter((k) => k.startsWith(`${vowelId}:`))
  }
  return (
    <BuildWordShell title={vowel.label} backHref={BUILD_WORD_BASE_PATH}>
      <BuildWordPlay vowel={vowel} words={words} masteredKeys={masteredKeys} />
    </BuildWordShell>
  )
}
