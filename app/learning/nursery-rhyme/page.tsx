import NurseryRhymePlay from '@/features/nursery-rhyme/components/NurseryRhymePlay'
import NurseryRhymeShell from '@/features/nursery-rhyme/components/NurseryRhymeShell'
import OfflineShell from '@/features/learning/components/OfflineShell'
import { getNurseryRhymeSets } from '@/lib/nursery-rhyme/data'
import { auth } from '@/lib/auth-server'
import { getNurseryRhymeMastery } from '@/lib/points/service'
import { resolveLearnerScope } from '@/lib/classroom/celebrate-scope'

export default async function NurseryRhymePage() {
  const sets = await getNurseryRhymeSets()
  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const scope = await resolveLearnerScope(session.user.id)
    const mastery = await getNurseryRhymeMastery(session.user.id, scope)
    masteredKeys = mastery.masteredKeys
  }

  const precacheUrls = sets
    .flatMap((s) => [s.audio, ...s.choices.map((c) => c.image)])
    .filter(Boolean) as string[]

  return (
    <NurseryRhymeShell title="Which two pictures rhyme?">
      <OfflineShell precacheUrls={precacheUrls} />
      <NurseryRhymePlay sets={sets} masteredKeys={masteredKeys} guest={!session?.user?.id} />
    </NurseryRhymeShell>
  )
}
