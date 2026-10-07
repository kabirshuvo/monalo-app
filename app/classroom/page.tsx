import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import ClassroomRoster from '@/features/classroom/components/ClassroomRoster'
import { getTeacherClassroom } from '@/lib/classroom/data'

export default async function ClassroomPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/classroom')

  const classroom = await getTeacherClassroom(session.user.id)

  return <ClassroomRoster initialClassroom={classroom} />
}
