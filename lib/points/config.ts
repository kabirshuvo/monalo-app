/** Points economy — amounts in Bangladeshi Taka (৳) unless noted. */

export const POINTS_CONFIG = {
  /** ৳100 spent → 1 point */
  takaPerPoint: 100,
  /** 5 minutes of blog reading → 1 point */
  blogMinutesPerPoint: 5,
  /** 1 minute of learning / course activity → 1 point */
  learningMinutesPerPoint: 1,
  lessonCompleteMin: 5,
  lessonCompleteMax: 10,
  /** Points for a first-time correct Eco Penguin answer */
  ecoPenguinCorrect: 2,
  /** Points for a first-time correct Vowel Words answer */
  vowelWordsCorrect: 2,
  /** Points for a first-time correct Digraphs answer */
  digraphsCorrect: 2,
  /** Points for a first-time Build-the-word spelling */
  buildWordCorrect: 2,
  /** Points for a first-time correct letter-sound quiz answer */
  letterSoundsCorrect: 2,
} as const

export function pointsFromPurchaseTaka(taka: number): number {
  if (taka <= 0) return 0
  return Math.floor(taka / POINTS_CONFIG.takaPerPoint)
}

export function pointsFromBlogMinutes(minutes: number): number {
  if (minutes <= 0) return 0
  return Math.floor(minutes / POINTS_CONFIG.blogMinutesPerPoint)
}

export function pointsFromLearningMinutes(minutes: number): number {
  if (minutes <= 0) return 0
  return Math.floor(minutes / POINTS_CONFIG.learningMinutesPerPoint)
}

export function pointsForLessonComplete(): number {
  const { lessonCompleteMin, lessonCompleteMax } = POINTS_CONFIG
  return (
    lessonCompleteMin +
    Math.floor(Math.random() * (lessonCompleteMax - lessonCompleteMin + 1))
  )
}

export function pointsForEcoPenguinCorrect(): number {
  return POINTS_CONFIG.ecoPenguinCorrect
}

export function pointsForVowelWordsCorrect(): number {
  return POINTS_CONFIG.vowelWordsCorrect
}

export function pointsForDigraphsCorrect(): number {
  return POINTS_CONFIG.digraphsCorrect
}

export function pointsForBuildWordCorrect(): number {
  return POINTS_CONFIG.buildWordCorrect
}

export function pointsForLetterSoundsCorrect(): number {
  return POINTS_CONFIG.letterSoundsCorrect
}

export function levelFromTotalPoints(totalPoints: number): number {
  return Math.max(1, Math.floor(totalPoints / 50) + 1)
}

export function badgeFromTotalPoints(totalPoints: number): string {
  if (totalPoints >= 500) return 'MonAlo Luminary'
  if (totalPoints >= 200) return 'Rising Scholar'
  if (totalPoints >= 50) return 'Curious Mind'
  return 'New Light'
}
