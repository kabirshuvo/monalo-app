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

function RegisterForm() {
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
      title="Join MonAlo"
      subtitle="Create your account with Google — learning, shop, and gallery in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Sign in
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

      <ul className="mt-8 space-y-3 text-sm text-content-secondary">
        <li className="flex gap-3">
          <span className="mt-0.5 text-emerald-600" aria-hidden>
            ✓
          </span>
          <span>One click — no password to remember</span>
        </li>
        <li className="flex gap-3">
          <span className="mt-0.5 text-emerald-600" aria-hidden>
            ✓
          </span>
          <span>Use the same Google account next time to sign in</span>
        </li>
        <li className="flex gap-3">
          <span className="mt-0.5 text-emerald-600" aria-hidden>
            ✓
          </span>
          <span>Start learning, shopping, and exploring right away</span>
        </li>
      </ul>
    </AuthShell>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <RegisterForm />
    </Suspense>
  )
}
