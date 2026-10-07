import SayItPlay from '@/features/say-it/components/SayItPlay'
import SayItShell from '@/features/say-it/components/SayItShell'
import { getSayItPrompts } from '@/lib/say-it/data'
import { auth } from '@/lib/auth-server'
import { getSayItMastery } from '@/lib/points/service'

export default async function SayItPage() {
  const prompts = await getSayItPrompts()
  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const mastery = await getSayItMastery(session.user.id)
    masteredKeys = mastery.masteredKeys
  }

  return (
    <SayItShell title="Listen. Say it out loud. Tap I said it.">
      <SayItPlay prompts={prompts} masteredKeys={masteredKeys} />
    </SayItShell>
  )
}
