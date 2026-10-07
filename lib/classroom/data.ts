import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { ACTIVE_LEARNER_COOKIE } from '@/lib/classroom/constants'

export type ClassroomWithLearners = Awaited<ReturnType<typeof getTeacherClassroom>>

export async function getTeacherClassroom(teacherId: string) {
  return prisma.classroom.findFirst({
    where: { teacherId },
    include: {
      learners: {
        where: { active: true },
        orderBy: [{ rollNo: 'asc' }, { displayName: 'asc' }],
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getLearnerOwnedByTeacher(learnerProfileId: string, teacherId: string) {
  return prisma.learnerProfile.findFirst({
    where: {
      id: learnerProfileId,
      active: true,
      classroom: { teacherId },
    },
    include: { classroom: true },
  })
}

/** Active kid from cookie, validated against teacher ownership. */
export async function getActiveLearnerForTeacher(teacherId: string) {
  const jar = await cookies()
  const id = jar.get(ACTIVE_LEARNER_COOKIE)?.value?.trim()
  if (!id) return null
  return getLearnerOwnedByTeacher(id, teacherId)
}

export async function ensureTeacherRole(userId: string, currentRole: string) {
  if (currentRole === 'TEACHER' || currentRole === 'ADMIN') return
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'TEACHER' },
  })
}
