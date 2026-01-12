"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Form, FormSection, FormActions, Input, Button, Alert } from '@/components/ui'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const status = sessionData?.status
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted flag for hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (!isMounted) return
    if (status === 'authenticated' && session) {
      const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
      router.push(callbackUrl)
    }
  }, [status, session, router, searchParams, isMounted])

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}
    
    if (!email) {
      errors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "This email address doesn't look quite right."
    }
    
    if (!password) {
      errors.password = 'Please enter your password.'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Gentle error messages based on NextAuth error types
        if (result.error === 'CredentialsSignin') {
          setError("Please check your email and password.")
        } else {
          setError("We couldn't sign you in right now. Please try again.")
        }
      } else if (result?.ok) {
        // Success - NextAuth will handle the redirect
        const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
        router.push(callbackUrl)
      !isMounted || }
    } catch (err) {
      setError("Something went wrong on our end. Please try again.")
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
          <Link href="/home" className="inline-flex items-center gap-2 text-2xl font-semibold text-gray-900 mb-2">
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
                label="Email address"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                disabled={isLoading}
                autoComplete="email"
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

