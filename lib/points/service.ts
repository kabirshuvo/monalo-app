import type { PointCategory } from '@prisma/client'
import { prisma } from '@/lib/db'
import {
  badgeFromTotalPoints,
  levelFromTotalPoints,
  pointsForLessonComplete,
  pointsForEcoPenguinCorrect,
  pointsForVowelWordsCorrect,
  pointsForDigraphsCorrect,
  pointsForBuildWordCorrect,
  pointsForLetterSoundsCorrect,
  pointsForBlendWordCorrect,
  pointsForBalloonLettersCorrect,
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

/** Award points for a first-time correct Eco Penguin answer (once per item). */
export async function awardEcoPenguinCorrect(
  userId: string,
  categorySlug: string,
  itemSlug: string,
  itemName: string
): Promise<{ awarded: boolean; points: number }> {
  const pts = pointsForEcoPenguinCorrect()
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pts,
    description: `Eco Penguin: ${itemName}`,
    referenceId: `ecopenguin:${categorySlug}:${itemSlug}`,
  })
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

/** Eco Penguin mastery from point events (`ecopenguin:category:item`). */
export type EcoPenguinMastery = {
  /** Keys like `animals:lion` */
  masteredKeys: string[]
  /** Count of mastered items per category slug */
  byCategory: Record<string, number>
}

export async function getEcoPenguinMastery(userId: string): Promise<EcoPenguinMastery> {
  const events = await prisma.pointEvent.findMany({
    where: {
      userId,
      category: 'LEARNING',
      referenceId: { startsWith: 'ecopenguin:' },
    },
    select: { referenceId: true },
  })

  const masteredKeys: string[] = []
  const byCategory: Record<string, number> = {}

  for (const event of events) {
    const ref = event.referenceId
    if (!ref) continue
    const parts = ref.split(':')
    if (parts.length < 3 || parts[0] !== 'ecopenguin') continue
    const categorySlug = parts[1]
    const itemSlug = parts.slice(2).join(':')
    if (!categorySlug || !itemSlug) continue
    const key = `${categorySlug}:${itemSlug}`
    masteredKeys.push(key)
    byCategory[categorySlug] = (byCategory[categorySlug] ?? 0) + 1
  }

  return { masteredKeys, byCategory }
}

/** Award points for a first-time correct Vowel Words answer (once per word). */
export async function awardVowelWordsCorrect(
  userId: string,
  vowelId: string,
  wordSlug: string,
  word: string
): Promise<{ awarded: boolean; points: number }> {
  const pts = pointsForVowelWordsCorrect()
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pts,
    description: `Vowel Words: ${word}`,
    referenceId: `vowel-words:${vowelId}:${wordSlug}`,
  })
}

/** Vowel Words mastery from point events (`vowel-words:vowel:slug`). */
export type VowelWordsMastery = {
  masteredKeys: string[]
  byVowel: Record<string, number>
}

export async function getVowelWordsMastery(userId: string): Promise<VowelWordsMastery> {
  const events = await prisma.pointEvent.findMany({
    where: {
      userId,
      category: 'LEARNING',
      referenceId: { startsWith: 'vowel-words:' },
    },
    select: { referenceId: true },
  })

  const masteredKeys: string[] = []
  const byVowel: Record<string, number> = {}

  for (const event of events) {
    const ref = event.referenceId
    if (!ref) continue
    const parts = ref.split(':')
    if (parts.length < 3 || parts[0] !== 'vowel-words') continue
    const vowelId = parts[1]
    const wordSlug = parts.slice(2).join(':')
    if (!vowelId || !wordSlug) continue
    const key = `${vowelId}:${wordSlug}`
    masteredKeys.push(key)
    byVowel[vowelId] = (byVowel[vowelId] ?? 0) + 1
  }

  return { masteredKeys, byVowel }
}

/** Award points for a first-time correct Digraphs answer (once per word). */
export async function awardDigraphsCorrect(
  userId: string,
  digraphId: string,
  wordSlug: string,
  word: string
): Promise<{ awarded: boolean; points: number }> {
  const pts = pointsForDigraphsCorrect()
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pts,
    description: `Digraphs: ${word}`,
    referenceId: `digraphs:${digraphId}:${wordSlug}`,
  })
}

/** Digraphs mastery from point events (`digraphs:id:slug`). */
export type DigraphsMastery = {
  masteredKeys: string[]
  byDigraph: Record<string, number>
}

export async function getDigraphsMastery(userId: string): Promise<DigraphsMastery> {
  const events = await prisma.pointEvent.findMany({
    where: {
      userId,
      category: 'LEARNING',
      referenceId: { startsWith: 'digraphs:' },
    },
    select: { referenceId: true },
  })

  const masteredKeys: string[] = []
  const byDigraph: Record<string, number> = {}

  for (const event of events) {
    const ref = event.referenceId
    if (!ref) continue
    const parts = ref.split(':')
    if (parts.length < 3 || parts[0] !== 'digraphs') continue
    const digraphId = parts[1]
    const wordSlug = parts.slice(2).join(':')
    if (!digraphId || !wordSlug) continue
    const key = `${digraphId}:${wordSlug}`
    masteredKeys.push(key)
    byDigraph[digraphId] = (byDigraph[digraphId] ?? 0) + 1
  }

  return { masteredKeys, byDigraph }
}

/** Award points for first-time Build-the-word spelling. */
export async function awardBuildWordCorrect(
  userId: string,
  vowelId: string,
  wordSlug: string,
  word: string
): Promise<{ awarded: boolean; points: number }> {
  const pts = pointsForBuildWordCorrect()
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pts,
    description: `Build the word: ${word}`,
    referenceId: `build-word:${vowelId}:${wordSlug}`,
  })
}

export type BuildWordMastery = {
  masteredKeys: string[]
  byVowel: Record<string, number>
}

export async function getBuildWordMastery(userId: string): Promise<BuildWordMastery> {
  const events = await prisma.pointEvent.findMany({
    where: {
      userId,
      category: 'LEARNING',
      referenceId: { startsWith: 'build-word:' },
    },
    select: { referenceId: true },
  })

  const masteredKeys: string[] = []
  const byVowel: Record<string, number> = {}

  for (const event of events) {
    const ref = event.referenceId
    if (!ref) continue
    const parts = ref.split(':')
    if (parts.length < 3 || parts[0] !== 'build-word') continue
    const vowelId = parts[1]
    const wordSlug = parts.slice(2).join(':')
    if (!vowelId || !wordSlug) continue
    masteredKeys.push(`${vowelId}:${wordSlug}`)
    byVowel[vowelId] = (byVowel[vowelId] ?? 0) + 1
  }

  return { masteredKeys, byVowel }
}

/** Award points for a first-time correct letter-sound quiz answer. */
export async function awardLetterSoundsCorrect(
  userId: string,
  letterId: string,
  keyword: string
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForLetterSoundsCorrect(),
    description: `Letter sounds: ${keyword}`,
    referenceId: `letter-sounds:${letterId}`,
  })
}

export type LetterSoundsMastery = {
  masteredKeys: string[]
}

export async function getLetterSoundsMastery(userId: string): Promise<LetterSoundsMastery> {
  const events = await prisma.pointEvent.findMany({
    where: {
      userId,
      category: 'LEARNING',
      referenceId: { startsWith: 'letter-sounds:' },
    },
    select: { referenceId: true },
  })

  const masteredKeys: string[] = []
  for (const event of events) {
    const ref = event.referenceId
    if (!ref) continue
    const letterId = ref.slice('letter-sounds:'.length)
    if (letterId) masteredKeys.push(letterId)
  }
  return { masteredKeys }
}

/** Award points for a first-time correct blend-the-word answer. */
export async function awardBlendWordCorrect(
  userId: string,
  wordId: string,
  word: string
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForBlendWordCorrect(),
    description: `Blend the word: ${word}`,
    referenceId: `blend-word:${wordId}`,
  })
}

export type BlendWordMastery = {
  masteredKeys: string[]
}

export async function getBlendWordMastery(userId: string): Promise<BlendWordMastery> {
  const events = await prisma.pointEvent.findMany({
    where: {
      userId,
      category: 'LEARNING',
      referenceId: { startsWith: 'blend-word:' },
    },
    select: { referenceId: true },
  })

  const masteredKeys: string[] = []
  for (const event of events) {
    const ref = event.referenceId
    if (!ref) continue
    const wordId = ref.slice('blend-word:'.length)
    if (wordId) masteredKeys.push(wordId)
  }
  return { masteredKeys }
}

/** Award points for a first-time correct balloon-letters catch. */
export async function awardBalloonLettersCorrect(
  userId: string,
  letterId: string,
  letter: string
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForBalloonLettersCorrect(),
    description: `Balloon letters: ${letter}`,
    referenceId: `balloon-letters:${letterId}`,
  })
}

export type BalloonLettersMastery = {
  masteredKeys: string[]
}

export async function getBalloonLettersMastery(userId: string): Promise<BalloonLettersMastery> {
  const events = await prisma.pointEvent.findMany({
    where: {
      userId,
      category: 'LEARNING',
      referenceId: { startsWith: 'balloon-letters:' },
    },
    select: { referenceId: true },
  })

  const masteredKeys: string[] = []
  for (const event of events) {
    const ref = event.referenceId
    if (!ref) continue
    const letterId = ref.slice('balloon-letters:'.length)
    if (letterId) masteredKeys.push(letterId)
  }
  return { masteredKeys }
}
