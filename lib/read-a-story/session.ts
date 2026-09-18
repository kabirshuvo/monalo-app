export const READ_STORY_SESSION_KEY = 'read-a-story:session'

export type ReadStorySession = {
  storyId: string
  page: number
  updatedAt: number
}

export function readReadStorySession(): ReadStorySession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(READ_STORY_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as ReadStorySession
    if (!p?.storyId) return null
    return {
      storyId: p.storyId,
      page: Math.max(1, Number(p.page) || 1),
      updatedAt: Number(p.updatedAt) || Date.now(),
    }
  } catch {
    return null
  }
}

export function writeReadStorySession(input: Omit<ReadStorySession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      READ_STORY_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}
