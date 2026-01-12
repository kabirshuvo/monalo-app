import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import LessonViewer from '@/components/courses/LessonViewer'

export const metadata = {
  title: 'Lesson - MonAlo',
}

export default async function LessonPage({
  params
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const session = await auth()

  if (!session || !session.user) redirect('/login')
  const role = (session.user as any)?.role
  if (role !== 'LEARNER' && role !== 'ADMIN') redirect('/dashboard')

  const { courseId, lessonId } = await params

  return (
    <DashboardLayout
      userRole={(role as 'LEARNER' | 'ADMIN') || 'LEARNER'}
      userName={session.user.name || 'Learner'}
      userAvatar={session.user.image || undefined}
      currentPath="/dashboard/learning"
    >
      <div className="max-w-4xl mx-auto">
        <LessonViewer courseId={courseId} lessonId={lessonId} />
      </div>
    </DashboardLayout>
  )
}
