import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import ClassroomSwitcher from '@/features/classroom/components/ClassroomSwitcher'
import { getActiveLearnerForTeacher, getTeacherClassroom } from '@/lib/classroom/data'

export default async function ClassroomSwitchPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/classroom/switch')

  const classroom = await getTeacherClassroom(session.user.id)
  if (!classroom) redirect('/classroom')

  const active = await getActiveLearnerForTeacher(session.user.id)

  return (
    <ClassroomSwitcher
      learners={classroom.learners}
      activeLearnerId={active?.id ?? null}
    />
  )
}
