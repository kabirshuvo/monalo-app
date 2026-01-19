"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Form, FormSection, FormActions, Input, Button, Alert } from '@/components/ui'
import { logEvent } from '@/lib/analytics'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const status = sessionData?.status
  
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({})
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted flag for hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (!isMounted) return
    if (status === 'authenticated' && session) {
      const callbackUrl = searchParams?.get('callbackUrl') || '/'
      router.push(callbackUrl)
    }
  }, [status, session, router, searchParams, isMounted])

  // Prefill identifier if provided (e.g. after registration)
  useEffect(() => {
    const registeredIdentifier = searchParams?.get('identifier') || searchParams?.get('email')
    if (registeredIdentifier) setIdentifier(registeredIdentifier)
  }, [searchParams])

  const validateForm = () => {
    const errors: { identifier?: string; password?: string } = {}

    const trimmed = identifier.trim()
    if (!trimmed) {
      errors.identifier = 'Please enter your email or phone number'
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
      const isPhone = /^\+?\d{10,15}$/.test(trimmed)
      if (!isEmail && !isPhone) {
        errors.identifier = 'That doesn’t look like a valid email or phone number'
      }
    }

    if (!password) {
      errors.password = 'Please enter your password'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFormMessage('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const trimmedIdentifier = identifier.trim()
      const result = await signIn('credentials', {
        identifier: trimmedIdentifier,
        password,
        // Perform a full redirect so the server reads the Set-Cookie
        // and the next page render has the authoritative session.
        redirect: true,
        callbackUrl: searchParams?.get('callbackUrl') || '/home',
      })

      // When using `redirect: true` a successful sign-in will perform a
      // full browser redirect and this code will typically not continue
      // executing. If an error occurs the sign-in flow may redirect to
      // the error page or return here depending on provider config.
      if (result && (result as any).error) {
        // Friendly authentication messages
        try {
          logEvent('login_failed', { identifier: trimmedIdentifier, reason: result.error, method: 'credentials' })
        } catch {}

        if (result.error === 'CredentialsSignin') {
          const msg = "Whoops — that didn’t work. Double-check your email/phone and password and try again."
          setError(msg)
          setFormMessage(msg)
        } else if (result.error === 'NoAccount' || result.error === 'No user' || result.error === 'No user found') {
          const msg = "We couldn’t find an account for that email or phone. Want to create one?"
          setError(msg)
          setFormMessage(msg)
        } else {
          const msg = 'Oops — something went wrong. Please try again in a moment.'
          setError(msg)
          setFormMessage(msg)
        }
      }
      // Note: on success the browser will be redirected by next-auth so
      // we don't perform an additional `router.push` here. We still record
      // the login start time in sessionStorage before the redirect above
      // so logout analytics remain accurate.
      try { sessionStorage.setItem('monalo_login_start', Date.now().toString()) } catch {}
      try {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier)
        const isPhone = /^\+?\d{10,15}$/.test(trimmedIdentifier)
        const identifierType = isEmail ? 'email' : (isPhone ? 'phone' : 'unknown')
        logEvent('login_success', { identifier: trimmedIdentifier, identifierType, method: 'credentials' })
      } catch {}
    } catch (err) {
      const msg = 'Oops — something went wrong. Please try again in a moment.'
      setError(msg)
      setFormMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Just a moment...</p>
        </div>
      </div>
    )
  }

  // Don't show form if already authenticated
  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-gray-900 mb-2">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>MonAlo</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Error Alert */}
          {error && (
            <Alert 
              variant="danger" 
              dismissible 
              onDismiss={() => setError('')}
              className="mb-6"
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Form onSubmit={handleSubmit}>
            <FormSection>
              <Input
                label="Email or phone"
                type="text"
                placeholder="you@example.com or +1 555 555 5555"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={fieldErrors.identifier}
                disabled={isLoading}
                autoComplete="username"
                required
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                disabled={isLoading}
                autoComplete="current-password"
                required
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Remember me</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </FormSection>

            {formMessage && (
              <div className="mb-4 text-center text-sm text-red-600">{formMessage}</div>
            )}
            <FormActions>
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </FormActions>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => signIn('google', { callbackUrl: searchParams?.get('callbackUrl') || '/' })}
              disabled={isLoading}
              className="flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </Button>

            {/* Facebook */}
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => signIn('facebook', { callbackUrl: searchParams?.get('callbackUrl') || '/' })}
              disabled={isLoading}
              className="flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </Button>

            {/* X (Twitter) */}
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => signIn('twitter', { callbackUrl: searchParams?.get('callbackUrl') || '/' })}
              disabled={isLoading}
              className="flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Continue with X</span>
            </Button>
          </div>
        </div>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          New to MonAlo?{' '}
          <Link 
            href="/register" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your account
          </Link>
        </p>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link 
            href="/home" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Just a moment...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

