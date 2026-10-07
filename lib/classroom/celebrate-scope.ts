import type { LearnerScope } from '@/lib/points/service'
import { getActiveLearnerForTeacher } from '@/lib/classroom/data'

/** Resolve classroom learner scope for celebrate / mastery when a kid is selected. */
export async function resolveLearnerScope(teacherUserId: string): Promise<LearnerScope> {
  const learner = await getActiveLearnerForTeacher(teacherUserId)
  if (!learner) return {}
  return { learnerProfileId: learner.id }
}
