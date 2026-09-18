import BlendWordPlay from '@/features/blend-the-word/components/BlendWordPlay'
import BlendWordShell from '@/features/blend-the-word/components/BlendWordShell'
import { resolveBlendWordAsset } from '@/lib/blend-the-word/assets'
import { getBlendWords } from '@/lib/blend-the-word/data'
import { auth } from '@/lib/auth-server'
import { getBlendWordMastery } from '@/lib/points/service'

export default async function BlendWordPage() {
  const words = await getBlendWords()
  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const mastery = await getBlendWordMastery(session.user.id)
    masteredKeys = mastery.masteredKeys
  }

  return (
    <BlendWordShell title="Hear the sounds, tap the picture">
      <BlendWordPlay
        words={words}
        masteredKeys={masteredKeys}
        successAudio={resolveBlendWordAsset('/audio/success.mp3')}
        errorAudio={resolveBlendWordAsset('/audio/error.mp3')}
      />
    </BlendWordShell>
  )
}
