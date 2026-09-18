import SegmentWordPlay from '@/features/segment-the-word/components/SegmentWordPlay'
import SegmentWordShell from '@/features/segment-the-word/components/SegmentWordShell'
import { resolveBlendWordAsset } from '@/lib/blend-the-word/assets'
import { getBlendWordsForMastery } from '@/lib/blend-the-word/data'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery, getSegmentWordMastery } from '@/lib/points/service'

export default async function SegmentWordPage() {
  const session = await auth()
  let masteredKeys: string[] = []
  let masteredBalloonKeys: string[] = []
  if (session?.user?.id) {
    const [seg, balloons] = await Promise.all([
      getSegmentWordMastery(session.user.id),
      getBalloonLettersMastery(session.user.id),
    ])
    masteredKeys = seg.masteredKeys
    masteredBalloonKeys = balloons.masteredKeys
  }
  const words = await getBlendWordsForMastery(masteredBalloonKeys)

  return (
    <SegmentWordShell title="Hear the word, tap the sounds">
      <SegmentWordPlay
        words={words}
        masteredKeys={masteredKeys}
        successAudio={resolveBlendWordAsset('/audio/success.mp3')}
        errorAudio={resolveBlendWordAsset('/audio/error.mp3')}
      />
    </SegmentWordShell>
  )
}
