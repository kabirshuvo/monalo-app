import type { Session } from 'next-auth'

/**
 * Avatar shown in UI: DB preset/custom URL first, then OAuth image.
 */
export function getUserAvatarFromSession(session: Session | null | undefined): string | undefined {
  if (!session?.user) return undefined
  const avatarUrl = (session.user as { avatarUrl?: string | null }).avatarUrl
  if (avatarUrl) return avatarUrl
  if (session.user.image) return session.user.image
  return undefined
}
