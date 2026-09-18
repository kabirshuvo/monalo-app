import BlendWordPlay from '@/features/blend-the-word/components/BlendWordPlay'
import BlendWordShell from '@/features/blend-the-word/components/BlendWordShell'
import { resolveBlendWordAsset } from '@/lib/blend-the-word/assets'
import { getBlendWordsForMastery } from '@/lib/blend-the-word/data'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery, getBlendWordMastery } from '@/lib/points/service'

export default async function BlendWordPage() {
  const session = await auth()
  let masteredKeys: string[] = []
  let masteredBalloonKeys: string[] = []
  if (session?.user?.id) {
    const [blendMastery, balloonMastery] = await Promise.all([
      getBlendWordMastery(session.user.id),
      getBalloonLettersMastery(session.user.id),
    ])
    masteredKeys = blendMastery.masteredKeys
    masteredBalloonKeys = balloonMastery.masteredKeys
  }
  const words = await getBlendWordsForMastery(masteredBalloonKeys)

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
