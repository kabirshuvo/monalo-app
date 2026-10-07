import OfflineShell from '@/features/learning/components/OfflineShell'
import ClassroomModeBar from '@/features/classroom/components/ClassroomModeBar'
import { auth } from '@/lib/auth-server'
import { getActiveLearnerForTeacher, getTeacherClassroom } from '@/lib/classroom/data'

/** Shared learning chrome: classroom banner + offline media cache. */
export default async function LearningLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  let learner: { id: string; displayName: string; avatarKey: string } | null = null
  let hasClassroom = false

  if (session?.user?.id) {
    const classroom = await getTeacherClassroom(session.user.id)
    hasClassroom = Boolean(classroom)
    const active = await getActiveLearnerForTeacher(session.user.id)
    if (active) {
      learner = {
        id: active.id,
        displayName: active.displayName,
        avatarKey: active.avatarKey,
      }
    }
  }

  const showBar =
    Boolean(session?.user?.id) &&
    (hasClassroom ||
      session?.user?.role === 'TEACHER' ||
      session?.user?.role === 'ADMIN' ||
      session?.user?.role === 'GUARDIAN')

  return (
    <>
      {showBar ? <ClassroomModeBar learner={learner} hasClassroom={hasClassroom} /> : null}
      {children}
      <OfflineShell />
    </>
  )
}
