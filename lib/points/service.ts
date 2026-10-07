import type { PointCategory } from '@prisma/client'
import { prisma } from '@/lib/db'
import { classroomReferenceId, stripClassroomReferenceId } from '@/lib/classroom/constants'
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
  pointsForPhonicsGroupSticker,
  pointsForSegmentWordCorrect,
  pointsForWhichSoundCorrect,
  pointsForReadStoryComplete,
  pointsForSightWordsCorrect,
  pointsForNurseryRhymeCorrect,
  pointsForConsonantBlendsCorrect,
  pointsForSayItCorrect,
  pointsForWriteItCorrect,
  pointsFromBlogMinutes,
  pointsFromLearningMinutes,
  pointsFromPurchaseTaka,
} from '@/lib/points/config'

export type LearnerScope = { learnerProfileId?: string }

/** Load LEARNING events for a user or classroom learner; returns stripped referenceIds. */
async function learningReferenceIds(
  userId: string,
  prefix: string,
  scope?: LearnerScope
): Promise<string[]> {
  const learnerProfileId = scope?.learnerProfileId
  const events = learnerProfileId
    ? await prisma.pointEvent.findMany({
        where: { learnerProfileId, category: 'LEARNING' },
        select: { referenceId: true },
      })
    : await prisma.pointEvent.findMany({
        where: {
          userId,
          category: 'LEARNING',
          learnerProfileId: null,
          referenceId: { startsWith: prefix },
        },
        select: { referenceId: true },
      })

  const out: string[] = []
  for (const event of events) {
    if (!event.referenceId) continue
    const ref = stripClassroomReferenceId(event.referenceId)
    if (!ref.startsWith(prefix)) continue
    const id = ref.slice(prefix.length)
    if (id) out.push(id)
  }
  return out
}


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
    learnerProfileId?: string
  }
): Promise<{ awarded: boolean; points: number }> {
  if (input.points <= 0) {
    return { awarded: false, points: 0 }
  }

  const referenceId =
    input.learnerProfileId && input.referenceId
      ? classroomReferenceId(input.learnerProfileId, input.referenceId)
      : input.referenceId

  try {
    if (referenceId) {
      const existing = await prisma.pointEvent.findUnique({
        where: {
          userId_category_referenceId: {
            userId,
            category: input.category,
            referenceId,
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
          learnerProfileId: input.learnerProfileId ?? null,
          category: input.category,
          points: input.points,
          description: input.description,
          referenceId: referenceId ?? null,
        },
      })
      // Classroom kid points still count on teacher account totals (school pilot simplicity)
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
  itemName: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  const pts = pointsForEcoPenguinCorrect()
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pts,
    description: `Eco Penguin: ${itemName}`,
    referenceId: `ecopenguin:${categorySlug}:${itemSlug}`,
    learnerProfileId: scope?.learnerProfileId,
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

export async function getEcoPenguinMastery(
  userId: string,
  scope?: LearnerScope
): Promise<EcoPenguinMastery> {
  const ids = await learningReferenceIds(userId, 'ecopenguin:', scope)
  const masteredKeys: string[] = []
  const byCategory: Record<string, number> = {}
  for (const rest of ids) {
    const parts = rest.split(':')
    if (parts.length < 2) continue
    const categorySlug = parts[0]
    const itemSlug = parts.slice(1).join(':')
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
  word: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  const pts = pointsForVowelWordsCorrect()
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pts,
    description: `Vowel Words: ${word}`,
    referenceId: `vowel-words:${vowelId}:${wordSlug}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

/** Vowel Words mastery from point events (`vowel-words:vowel:slug`). */
export type VowelWordsMastery = {
  masteredKeys: string[]
  byVowel: Record<string, number>
}

export async function getVowelWordsMastery(
  userId: string,
  scope?: LearnerScope
): Promise<VowelWordsMastery> {
  const ids = await learningReferenceIds(userId, 'vowel-words:', scope)
  const masteredKeys: string[] = []
  const byVowel: Record<string, number> = {}
  for (const rest of ids) {
    const parts = rest.split(':')
    if (parts.length < 2) continue
    const vowelId = parts[0]
    const wordSlug = parts.slice(1).join(':')
    if (!vowelId || !wordSlug) continue
    masteredKeys.push(`${vowelId}:${wordSlug}`)
    byVowel[vowelId] = (byVowel[vowelId] ?? 0) + 1
  }
  return { masteredKeys, byVowel }
}

/** Award points for a first-time correct Digraphs answer (once per word). */
export async function awardDigraphsCorrect(
  userId: string,
  digraphId: string,
  wordSlug: string,
  word: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  const pts = pointsForDigraphsCorrect()
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pts,
    description: `Digraphs: ${word}`,
    referenceId: `digraphs:${digraphId}:${wordSlug}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

/** Digraphs mastery from point events (`digraphs:id:slug`). */
export type DigraphsMastery = {
  masteredKeys: string[]
  byDigraph: Record<string, number>
}

export async function getDigraphsMastery(
  userId: string,
  scope?: LearnerScope
): Promise<DigraphsMastery> {
  const ids = await learningReferenceIds(userId, 'digraphs:', scope)
  const masteredKeys: string[] = []
  const byDigraph: Record<string, number> = {}
  for (const rest of ids) {
    const parts = rest.split(':')
    if (parts.length < 2) continue
    const digraphId = parts[0]
    const wordSlug = parts.slice(1).join(':')
    if (!digraphId || !wordSlug) continue
    masteredKeys.push(`${digraphId}:${wordSlug}`)
    byDigraph[digraphId] = (byDigraph[digraphId] ?? 0) + 1
  }
  return { masteredKeys, byDigraph }
}

/** Award points for first-time Build-the-word spelling. */
export async function awardBuildWordCorrect(
  userId: string,
  vowelId: string,
  wordSlug: string,
  word: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  const pts = pointsForBuildWordCorrect()
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pts,
    description: `Build the word: ${word}`,
    referenceId: `build-word:${vowelId}:${wordSlug}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export type BuildWordMastery = {
  masteredKeys: string[]
  byVowel: Record<string, number>
}

export async function getBuildWordMastery(
  userId: string,
  scope?: LearnerScope
): Promise<BuildWordMastery> {
  const ids = await learningReferenceIds(userId, 'build-word:', scope)
  const masteredKeys: string[] = []
  const byVowel: Record<string, number> = {}
  for (const rest of ids) {
    const parts = rest.split(':')
    if (parts.length < 2) continue
    const vowelId = parts[0]
    const wordSlug = parts.slice(1).join(':')
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
  keyword: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForLetterSoundsCorrect(),
    description: `Letter sounds: ${keyword}`,
    referenceId: `letter-sounds:${letterId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export type LetterSoundsMastery = {
  masteredKeys: string[]
}

export async function getLetterSoundsMastery(
  userId: string,
  scope?: LearnerScope
): Promise<LetterSoundsMastery> {
  const masteredKeys = await learningReferenceIds(userId, 'letter-sounds:', scope)
  return { masteredKeys }
}

/** Award points for a first-time correct blend-the-word answer. */
export async function awardBlendWordCorrect(
  userId: string,
  wordId: string,
  word: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForBlendWordCorrect(),
    description: `Blend the word: ${word}`,
    referenceId: `blend-word:${wordId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export type BlendWordMastery = {
  masteredKeys: string[]
}

export async function getBlendWordMastery(
  userId: string,
  scope?: LearnerScope
): Promise<BlendWordMastery> {
  const masteredKeys = await learningReferenceIds(userId, 'blend-word:', scope)
  return { masteredKeys }
}

/** Award points for a first-time correct balloon-letters catch. */
export async function awardBalloonLettersCorrect(
  userId: string,
  letterId: string,
  letter: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForBalloonLettersCorrect(),
    description: `Balloon letters: ${letter}`,
    referenceId: `balloon-letters:${letterId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export type BalloonLettersMastery = {
  masteredKeys: string[]
}

export async function getBalloonLettersMastery(
  userId: string,
  scope?: LearnerScope
): Promise<BalloonLettersMastery> {
  const masteredKeys = await learningReferenceIds(userId, 'balloon-letters:', scope)
  return { masteredKeys }
}

/** Award a one-time sticker gift for completing a phonics group in Balloon letters. */
export async function awardPhonicsGroupSticker(
  userId: string,
  groupId: string,
  label: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForPhonicsGroupSticker(),
    description: `Sticker gift: ${label}`,
    referenceId: `sticker:${groupId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export type EcoPenguinStickerState = {
  earnedIds: string[]
}

export async function getEcoPenguinStickers(
  userId: string,
  scope?: LearnerScope
): Promise<EcoPenguinStickerState> {
  const earnedIds = await learningReferenceIds(userId, 'sticker:', scope)
  return { earnedIds }
}

export async function awardSegmentWordCorrect(
  userId: string,
  wordId: string,
  word: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForSegmentWordCorrect(),
    description: `Segment the word: ${word}`,
    referenceId: `segment-word:${wordId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export async function getSegmentWordMastery(
  userId: string,
  scope?: LearnerScope
): Promise<{ masteredKeys: string[] }> {
  const masteredKeys = await learningReferenceIds(userId, 'segment-word:', scope)
  return { masteredKeys }
}

export async function awardWhichSoundCorrect(
  userId: string,
  letterId: string,
  letter: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForWhichSoundCorrect(),
    description: `Which sound: ${letter}`,
    referenceId: `which-sound:${letterId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export async function getWhichSoundMastery(
  userId: string,
  scope?: LearnerScope
): Promise<{ masteredKeys: string[] }> {
  const masteredKeys = await learningReferenceIds(userId, 'which-sound:', scope)
  return { masteredKeys }
}

export async function awardReadStoryComplete(
  userId: string,
  storyId: string,
  title: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForReadStoryComplete(),
    description: `Read a story: ${title}`,
    referenceId: `read-story:${storyId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export async function getReadStoryMastery(
  userId: string,
  scope?: LearnerScope
): Promise<{ completedIds: string[] }> {
  const completedIds = await learningReferenceIds(userId, 'read-story:', scope)
  return { completedIds }
}

export async function awardSightWordsCorrect(
  userId: string,
  wordId: string,
  word: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForSightWordsCorrect(),
    description: `Sight word: ${word}`,
    referenceId: `sight-word:${wordId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export async function getSightWordsMastery(
  userId: string,
  scope?: LearnerScope
): Promise<{ masteredKeys: string[] }> {
  const masteredKeys = await learningReferenceIds(userId, 'sight-word:', scope)
  return { masteredKeys }
}

export async function awardNurseryRhymeCorrect(
  userId: string,
  setId: string,
  label: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForNurseryRhymeCorrect(),
    description: `Rhyme: ${label}`,
    referenceId: `nursery-rhyme:${setId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export async function getNurseryRhymeMastery(
  userId: string,
  scope?: LearnerScope
): Promise<{ masteredKeys: string[] }> {
  const masteredKeys = await learningReferenceIds(userId, 'nursery-rhyme:', scope)
  return { masteredKeys }
}

export async function awardConsonantBlendsCorrect(
  userId: string,
  wordId: string,
  word: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForConsonantBlendsCorrect(),
    description: `Consonant blend: ${word}`,
    referenceId: `consonant-blend:${wordId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export async function getConsonantBlendsMastery(
  userId: string,
  scope?: LearnerScope
): Promise<{ masteredKeys: string[] }> {
  const masteredKeys = await learningReferenceIds(userId, 'consonant-blend:', scope)
  return { masteredKeys }
}

export async function awardSayItCorrect(
  userId: string,
  promptId: string,
  label: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForSayItCorrect(),
    description: `Say it: ${label}`,
    referenceId: `say-it:${promptId}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export async function getSayItMastery(
  userId: string,
  scope?: LearnerScope
): Promise<{ masteredKeys: string[] }> {
  const masteredKeys = await learningReferenceIds(userId, 'say-it:', scope)
  return { masteredKeys }
}

export async function awardWriteItCorrect(
  userId: string,
  itemKey: string,
  label: string,
  scope?: LearnerScope
): Promise<{ awarded: boolean; points: number }> {
  return awardPoints(userId, {
    category: 'LEARNING',
    points: pointsForWriteItCorrect(),
    description: label,
    referenceId: `write-it:${itemKey}`,
    learnerProfileId: scope?.learnerProfileId,
  })
}

export async function getWriteItMastery(
  userId: string,
  scope?: LearnerScope
): Promise<{ masteredKeys: string[] }> {
  const masteredKeys = await learningReferenceIds(userId, 'write-it:', scope)
  return { masteredKeys }
}
