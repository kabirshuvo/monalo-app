"use client"

import React, { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLoadingScreen } from '@/components/ui'
import { AuthShell } from '@/components/auth/AuthShell'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { messageForAuthError } from '@/lib/auth/oauth-errors'
import { rememberSignInMethod } from '@/lib/auth/last-method'
import { sanitizeAuthCallbackUrl } from '@/lib/auth/post-auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    if (status === 'authenticated' && session) {
      router.replace(sanitizeAuthCallbackUrl(searchParams?.get('callbackUrl')))
    }
  }, [status, session, router, searchParams, isMounted])

  useEffect(() => {
    if (!isMounted) return
    const authError = searchParams?.get('error')
    if (authError) {
      const msg = messageForAuthError(authError)
      if (msg) setError(msg)
    }
  }, [searchParams, isMounted])

  if (status === 'loading') {
    return <AuthLoadingScreen />
  }

  if (status === 'authenticated') {
    return null
  }

  const callbackUrl = sanitizeAuthCallbackUrl(searchParams?.get('callbackUrl'))

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with Google to continue learning and creating on MonAlo."
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Create an account
          </Link>
        </>
      }
    >
      {error ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </div>
      ) : null}

      <GoogleSignInButton
        callbackUrl={callbackUrl}
        label="Continue with Google"
        onBeforeSignIn={() => rememberSignInMethod('google')}
      />

      <p className="mt-6 text-center text-xs leading-relaxed text-content-muted">
        By continuing, you agree to use MonAlo with the Google account you choose.
      </p>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <LoginForm />
    </Suspense>
  )
}
