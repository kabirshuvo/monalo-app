import { prisma } from '@/lib/db'
import { aggregateReactionCounts, emptyReactionCounts, type BlogReactionCounts } from '@/lib/blog/stats'

export type ReactionType = 'LOVE' | 'LIKE' | 'DISLIKE'

const VALID_TYPES = new Set<ReactionType>(['LOVE', 'LIKE', 'DISLIKE'])

function parseType(value: string): ReactionType | null {
  const upper = value.toUpperCase()
  return VALID_TYPES.has(upper as ReactionType) ? (upper as ReactionType) : null
}

/** Raw SQL — reliable on Cloudflare Workers (Prisma relation delegate can fail on new models). */
export async function fetchReactionCounts(blogId: string): Promise<BlogReactionCounts> {
  try {
    const rows = await prisma.$queryRaw<Array<{ type: string }>>`
      SELECT type::text AS type FROM blog_reactions WHERE blog_id = ${blogId}
    `
    const typed = rows
      .map((r) => parseType(r.type))
      .filter((t): t is ReactionType => t !== null)
      .map((type) => ({ type }))
    return aggregateReactionCounts(typed)
  } catch (error) {
    console.error('[fetchReactionCounts]', error)
    return emptyReactionCounts()
  }
}

export async function fetchUserReaction(
  blogId: string,
  userId: string
): Promise<ReactionType | null> {
  try {
    const rows = await prisma.$queryRaw<Array<{ type: string }>>`
      SELECT type::text AS type FROM blog_reactions
      WHERE blog_id = ${blogId} AND user_id = ${userId}
      LIMIT 1
    `
    const first = rows[0]?.type
    return first ? parseType(first) : null
  } catch (error) {
    console.error('[fetchUserReaction]', error)
    return null
  }
}

export async function setUserReaction(
  blogId: string,
  userId: string,
  type: ReactionType | null
): Promise<void> {
  if (type === null) {
    await prisma.$executeRaw`
      DELETE FROM blog_reactions WHERE blog_id = ${blogId} AND user_id = ${userId}
    `
    return
  }

  await prisma.$executeRaw`
    INSERT INTO blog_reactions (id, blog_id, user_id, type, created_at, updated_at)
    VALUES (gen_random_uuid()::text, ${blogId}, ${userId}, ${type}::"BlogReactionType", NOW(), NOW())
    ON CONFLICT (user_id, blog_id)
    DO UPDATE SET type = EXCLUDED.type, updated_at = NOW()
  `
}

export async function toggleUserReaction(
  blogId: string,
  userId: string,
  type: ReactionType | null
): Promise<void> {
  const existing = await fetchUserReaction(blogId, userId)
  if (type === null || existing === type) {
    await setUserReaction(blogId, userId, null)
  } else {
    await setUserReaction(blogId, userId, type)
  }
}

export function isValidReactionType(value: unknown): value is ReactionType {
  return typeof value === 'string' && VALID_TYPES.has(value as ReactionType)
}
