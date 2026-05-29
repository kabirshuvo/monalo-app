import type { PointCategory } from '@prisma/client'
import { prisma } from '@/lib/db'
import {
  badgeFromTotalPoints,
  levelFromTotalPoints,
  pointsForLessonComplete,
  pointsFromBlogMinutes,
  pointsFromLearningMinutes,
  pointsFromPurchaseTaka,
} from '@/lib/points/config'

export type PointsBreakdown = {
  totalPoints: number
  level: number
  badge: string
  learning: { minutes: number; points: number }
  reading: { minutes: number; points: number }
  purchases: { taka: number; points: number }
  lessons: { completed: number; points: number }
}

async function sumCategoryPoints(userId: string, category: PointCategory): Promise<number> {
  const result = await prisma.pointEvent.aggregate({
    where: { userId, category },
    _sum: { points: true },
  })
  return result._sum.points ?? 0
}

async function refreshUserGamification(userId: string): Promise<void> {
  const totalResult = await prisma.pointEvent.aggregate({
    where: { userId },
    _sum: { points: true },
  })
  const totalPoints = totalResult._sum.points ?? 0
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalPoints,
      level: levelFromTotalPoints(totalPoints),
      badge: badgeFromTotalPoints(totalPoints),
    },
  })
}

export async function awardPoints(
  userId: string,
  input: {
    category: PointCategory
    points: number
    description: string
    referenceId?: string
  }
): Promise<{ awarded: boolean; points: number }> {
  if (input.points <= 0) {
    return { awarded: false, points: 0 }
  }

  try {
    if (input.referenceId) {
      const existing = await prisma.pointEvent.findUnique({
        where: {
          userId_category_referenceId: {
            userId,
            category: input.category,
            referenceId: input.referenceId,
          },
        },
      })
      if (existing) {
        return { awarded: false, points: 0 }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.pointEvent.create({
        data: {
          userId,
          category: input.category,
          points: input.points,
          description: input.description,
          referenceId: input.referenceId ?? null,
        },
      })
      await tx.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: input.points } },
      })
    })

    await refreshUserGamification(userId)
    return { awarded: true, points: input.points }
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return { awarded: false, points: 0 }
    }
    throw error
  }
}

/** Sync blog reading minutes and award delta points (5 min = 1 pt). */
export async function syncBlogReadingMinutes(
  userId: string,
  totalMinutes: number
): Promise<{ pointsAwarded: number }> {
  const minutes = Math.max(0, Math.floor(totalMinutes))
  const targetPoints = pointsFromBlogMinutes(minutes)
  const currentPoints = await sumCategoryPoints(userId, 'BLOG_READING')
  const delta = targetPoints - currentPoints

  await prisma.user.update({
    where: { id: userId },
    data: { blogReadingMinutes: minutes },
  })

  if (delta > 0) {
    await awardPoints(userId, {
      category: 'BLOG_READING',
      points: delta,
      description: `Blog reading (${minutes} min)`,
      referenceId: `blog-sync-${minutes}`,
    })
  }

  return { pointsAwarded: Math.max(0, delta) }
}

/** Sync learning minutes — 1 point per minute. */
export async function syncLearningMinutes(
  userId: string,
  totalMinutes: number
): Promise<{ pointsAwarded: number }> {
  const minutes = Math.max(0, Math.floor(totalMinutes))
  const targetPoints = pointsFromLearningMinutes(minutes)
  const currentPoints = await sumCategoryPoints(userId, 'LEARNING')
  const delta = targetPoints - currentPoints

  await prisma.user.update({
    where: { id: userId },
    data: { learningMinutes: minutes },
  })

  if (delta > 0) {
    await awardPoints(userId, {
      category: 'LEARNING',
      points: delta,
      description: `Learning activity (${minutes} min)`,
      referenceId: `learning-sync-${minutes}`,
    })
  }

  return { pointsAwarded: Math.max(0, delta) }
}

/** Award points when a lesson is completed (5–10 pts, once per lesson). */
export async function awardLessonComplete(
  userId: string,
  lessonId: string,
  lessonTitle?: string
): Promise<{ awarded: boolean; points: number }> {
  const pts = pointsForLessonComplete()
  const result = await awardPoints(userId, {
    category: 'LESSON_COMPLETE',
    points: pts,
    description: lessonTitle ? `Completed: ${lessonTitle}` : 'Lesson completed',
    referenceId: lessonId,
  })

  if (result.awarded) {
    await prisma.user.update({
      where: { id: userId },
      data: { lessonsCompleted: { increment: 1 } },
    })
  }

  return result
}

/**
 * Award purchase points from order total (৳).
 * `totalAmount` on orders is stored as whole taka in this app.
 */
export async function awardPurchasePoints(
  userId: string,
  orderId: string,
  totalAmountTaka: number
): Promise<{ awarded: boolean; points: number }> {
  const taka = Math.max(0, Math.floor(totalAmountTaka))
  const pts = pointsFromPurchaseTaka(taka)
  const result = await awardPoints(userId, {
    category: 'PURCHASE',
    points: pts,
    description: `Purchase ৳${taka.toLocaleString()}`,
    referenceId: orderId,
  })

  if (result.awarded && taka > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { purchaseAmountTaka: { increment: taka } },
    })
  }

  return result
}

export async function getPointsBreakdown(userId: string): Promise<PointsBreakdown> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalPoints: true,
      level: true,
      badge: true,
      blogReadingMinutes: true,
      learningMinutes: true,
      lessonsCompleted: true,
      purchaseAmountTaka: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const [purchasePts, blogPts, learningPts, lessonPts] = await Promise.all([
    sumCategoryPoints(userId, 'PURCHASE'),
    sumCategoryPoints(userId, 'BLOG_READING'),
    sumCategoryPoints(userId, 'LEARNING'),
    sumCategoryPoints(userId, 'LESSON_COMPLETE'),
  ])

  return {
    totalPoints: user.totalPoints,
    level: user.level,
    badge: user.badge ?? badgeFromTotalPoints(user.totalPoints),
    learning: { minutes: user.learningMinutes, points: learningPts },
    reading: { minutes: user.blogReadingMinutes, points: blogPts },
    purchases: { taka: user.purchaseAmountTaka, points: purchasePts },
    lessons: { completed: user.lessonsCompleted, points: lessonPts },
  }
}

export async function getRecentPointEvents(userId: string, limit = 10) {
  return prisma.pointEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
