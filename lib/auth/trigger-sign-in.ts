'use client'

import { signIn } from 'next-auth/react'
import { googleEnabled } from '@/components/auth/GoogleSignInButton'
import { beginExplicitSignIn } from '@/lib/auth/client-sign-out'
import { DEFAULT_POST_AUTH_PATH } from '@/lib/auth/post-auth'

/** Start Google OAuth or open the login page, then return to the landing page. */
export function triggerSignIn(callbackUrl: string = DEFAULT_POST_AUTH_PATH): void {
  const forceAccountPicker = beginExplicitSignIn()

  if (googleEnabled) {
    void signIn(
      'google',
      { callbackUrl },
      forceAccountPicker ? { prompt: 'select_account' } : undefined
    )
    return
  }

  const loginUrl = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
  window.location.href = forceAccountPicker ? `${loginUrl}&fresh=1` : loginUrl
}
