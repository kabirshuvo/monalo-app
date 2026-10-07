import { auth } from '@/lib/auth-server'
import { redirect, notFound } from 'next/navigation'
import ProgressSlip from '@/features/classroom/components/ProgressSlip'
import { getLearnerOwnedByTeacher } from '@/lib/classroom/data'
import { getSightWords } from '@/lib/sight-words/data'
import { recommendNextRoom } from '@/lib/learning/learning-path'
import { PHONICS_STICKERS } from '@/lib/learning/phonics-progress'
import {
  getBalloonLettersMastery,
  getEcoPenguinStickers,
  getReadStoryMastery,
  getSightWordsMastery,
} from '@/lib/points/service'

type Props = { params: Promise<{ learnerId: string }> }

export default async function ProgressSlipPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/classroom/board')

  const { learnerId } = await params
  const learner = await getLearnerOwnedByTeacher(learnerId, session.user.id)
  if (!learner) notFound()

  const scope = { learnerProfileId: learner.id }
  const teacherId = session.user.id
  const [stickers, balloons, sight, stories, sightWords] = await Promise.all([
    getEcoPenguinStickers(teacherId, scope),
    getBalloonLettersMastery(teacherId, scope),
    getSightWordsMastery(teacherId, scope),
    getReadStoryMastery(teacherId, scope),
    getSightWords(),
  ])

  const next = recommendNextRoom(balloons.masteredKeys, stickers.earnedIds, {
    sightWordsMastered: sight.masteredKeys.length,
    sightWordsTotal: sightWords.length,
    storiesCompleted: stories.completedIds.length,
  })

  const stickerLabels = stickers.earnedIds.map(
    (id) => PHONICS_STICKERS.find((s) => s.id === id)?.label ?? id
  )

  return (
    <ProgressSlip
      displayName={learner.displayName}
      avatarKey={learner.avatarKey}
      rollNo={learner.rollNo}
      className={learner.classroom.name}
      schoolName={learner.classroom.schoolName}
      stickers={stickerLabels}
      sightMastered={sight.masteredKeys.length}
      sightTotal={sightWords.length}
      balloons={balloons.masteredKeys.length}
      stories={stories.completedIds.length}
      nextTitle={next.title}
      nextDetail={next.detail}
      dateLabel={new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    />
  )
}
