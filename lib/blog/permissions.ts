import type { Blog } from '@prisma/client'
import type { Role } from '@prisma/client'

export function canManageAllPosts(role: Role | string | undefined): boolean {
  return role === 'ADMIN'
}

export function canEditPost(
  role: Role | string | undefined,
  userId: string | undefined,
  post: Pick<Blog, 'authorId'>
): boolean {
  if (!userId) return false
  if (role === 'ADMIN') return true
  if (role === 'WRITER') return post.authorId === userId
  return false
}
