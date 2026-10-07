import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import ClassroomBoard, {
  nextRoomTitleForKid,
  type BoardKidRow,
} from '@/features/classroom/components/ClassroomBoard'
import { getTeacherClassroom } from '@/lib/classroom/data'
import { getSightWords } from '@/lib/sight-words/data'
import {
  getBalloonLettersMastery,
  getEcoPenguinStickers,
  getReadStoryMastery,
  getSightWordsMastery,
} from '@/lib/points/service'

export default async function ClassroomBoardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/classroom/board')

  const classroom = await getTeacherClassroom(session.user.id)
  if (!classroom) redirect('/classroom')

  const sightWords = await getSightWords()
  const teacherId = session.user.id

  const rows: BoardKidRow[] = await Promise.all(
    classroom.learners.map(async (kid) => {
      const scope = { learnerProfileId: kid.id }
      const [stickers, balloons, sight, stories] = await Promise.all([
        getEcoPenguinStickers(teacherId, scope),
        getBalloonLettersMastery(teacherId, scope),
        getSightWordsMastery(teacherId, scope),
        getReadStoryMastery(teacherId, scope),
      ])
      const nextTitle = nextRoomTitleForKid(balloons.masteredKeys, stickers.earnedIds, {
        sightWordsMastered: sight.masteredKeys.length,
        sightWordsTotal: sightWords.length,
        storiesCompleted: stories.completedIds.length,
      })
      return {
        id: kid.id,
        displayName: kid.displayName,
        avatarKey: kid.avatarKey,
        rollNo: kid.rollNo,
        stickers: stickers.earnedIds.length,
        sightMastered: sight.masteredKeys.length,
        sightTotal: sightWords.length,
        balloons: balloons.masteredKeys.length,
        stories: stories.completedIds.length,
        nextTitle,
        slipHref: `/classroom/slip/${kid.id}`,
      }
    })
  )

  return (
    <ClassroomBoard className={classroom.name} schoolName={classroom.schoolName} rows={rows} />
  )
}
