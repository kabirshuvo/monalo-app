'use client'

import { useSession } from 'next-auth/react'
import { isGuestAfterSignOut } from '@/lib/auth/client-sign-out'

/** True only when the client has a live signed-in session (not loading / signing out). */
export function useAuthNav() {
  const { data: session, status } = useSession()
  const guestAfterSignOut = isGuestAfterSignOut()

  // After sign-out, ignore stale /api/auth/session until the user clicks Sign in again.
  if (guestAfterSignOut) {
    return {
      session: null,
      status: 'unauthenticated' as const,
      isAuthenticated: false,
      isLoading: false,
    }
  }

  const hasLiveSession =
    status === 'authenticated' && Boolean(session?.user?.email || session?.user?.id)

  if (hasLiveSession) {
    return {
      session,
      status,
      isAuthenticated: true,
      isLoading: false,
    }
  }

  const isLoading = status === 'loading'

  return {
    session,
    status,
    isAuthenticated: false,
    isLoading,
  }
}
