import { readingTimeMinutes } from '@/lib/blog/content'
import { POINTS_CONFIG, pointsFromBlogMinutes } from '@/lib/points/config'

export type BlogArticleStats = {
  minutes: number
  points: number
  readLabel: string
  pointsLabel: string
  pointsHint: string
}

export function blogArticleStats(content: string): BlogArticleStats {
  const minutes = readingTimeMinutes(content)
  const points = pointsFromBlogMinutes(minutes)
  const interval = POINTS_CONFIG.blogMinutesPerPoint

  return {
    minutes,
    points,
    readLabel: `${minutes} min read`,
    pointsLabel:
      points === 0
        ? `Read ${interval} min to earn 1 pt`
        : points === 1
          ? '1 pt for learners'
          : `${points} pts for learners`,
    pointsHint: `1 pt every ${interval} min while reading`,
  }
}

export type BlogReactionCounts = {
  love: number
  like: number
  dislike: number
  total: number
}

export function emptyReactionCounts(): BlogReactionCounts {
  return { love: 0, like: 0, dislike: 0, total: 0 }
}

export function aggregateReactionCounts(
  rows: { type: 'LOVE' | 'LIKE' | 'DISLIKE' }[]
): BlogReactionCounts {
  const counts = emptyReactionCounts()
  for (const row of rows) {
    if (row.type === 'LOVE') counts.love++
    else if (row.type === 'LIKE') counts.like++
    else if (row.type === 'DISLIKE') counts.dislike++
  }
  counts.total = counts.love + counts.like + counts.dislike
  return counts
}
