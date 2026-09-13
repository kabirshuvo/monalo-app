'use client'

import { signIn } from 'next-auth/react'
import { beginExplicitSignIn } from '@/lib/auth/client-sign-out'
import { DEFAULT_POST_AUTH_PATH } from '@/lib/auth/post-auth'

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === 'true'

type GoogleSignInButtonProps = {
  callbackUrl?: string
  disabled?: boolean
  label?: string
  onBeforeSignIn?: () => void
}

export function GoogleSignInButton({
  callbackUrl = DEFAULT_POST_AUTH_PATH,
  disabled = false,
  label = 'Continue with Google',
  onBeforeSignIn,
}: GoogleSignInButtonProps) {
  if (!googleEnabled) {
    return (
      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
        Google sign-in is not configured. Set <code className="font-mono text-xs">GOOGLE_CLIENT_ID</code> and{' '}
        <code className="font-mono text-xs">GOOGLE_CLIENT_SECRET</code>.
      </p>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        onBeforeSignIn?.()
        const forceAccountPicker = beginExplicitSignIn()
        const authParams = forceAccountPicker ? { prompt: 'select_account' } : undefined
        void signIn('google', { callbackUrl }, authParams)
      }}
      disabled={disabled}
      className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-subtle bg-white px-5 py-3.5 text-base font-medium text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-600 dark:hover:bg-stone-800"
    >
      <svg className="h-5 w-5 shrink-0 transition group-hover:scale-105" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>{label}</span>
    </button>
  )
}

export { googleEnabled }
