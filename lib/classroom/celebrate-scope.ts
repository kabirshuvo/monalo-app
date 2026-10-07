import type { LearnerScope } from '@/lib/points/service'
import { getActiveLearnerForTeacher } from '@/lib/classroom/data'

/**
 * Resolve classroom learner scope for celebrate / mastery when a kid is selected.
 * Never throws: a classroom lookup failure must not block a child's own progress.
 */
export async function resolveLearnerScope(teacherUserId: string): Promise<LearnerScope> {
  try {
    const learner = await getActiveLearnerForTeacher(teacherUserId)
    if (!learner) return {}
    return { learnerProfileId: learner.id }
  } catch (error) {
    console.error('[classroom] resolveLearnerScope failed', error)
    return {}
  }
}
