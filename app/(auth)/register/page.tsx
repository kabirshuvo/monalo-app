"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Form, FormSection, FormActions, Input, Button, Alert } from '@/components/ui'
import { logEvent } from '@/lib/analytics'

function RegisterForm() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const status = sessionData?.status
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted flag for hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (!isMounted) return
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [status, session, router, isMounted])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Please tell us what we should call you 🙂'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'That name looks a bit short'
    } else if (formData.name.trim().length > 50) {
      errors.name = 'That name looks a bit long'
    }

    // Email is optional but if present must be valid
    if (formData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'That email doesn’t look right'
      }
    }

    // Phone is optional but if present must be plausible
    if (formData.phone) {
      if (!/^\+?[0-9 \-()]{7,20}$/.test(formData.phone)) {
        errors.phone = 'That phone number doesn’t look right'
      }
    }

    // Require at least one contact method
    if (!formData.email && !formData.phone) {
      const msg = 'Please add an email or a phone number'
      errors.email = msg
      errors.phone = msg
    }

    if (!formData.password) {
      errors.password = 'Please create a password'
    } else if (formData.password.length < 6) {
      errors.password = 'Password should be at least 6 characters'
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific API error cases with friendly messages
        if (response.status === 409) {
          if (data.message?.includes('email')) {
            setFieldErrors(prev => ({ ...prev, email: 'This email is already used. Try signing in instead.' }))
          } else if (data.message?.includes('phone')) {
            setFieldErrors(prev => ({ ...prev, phone: 'This phone number is already used. Try signing in instead.' }))
          } else {
            setError("We couldn’t create your account right now. Please try again.")
          }
        } else {
          setError("We couldn’t create your account right now. Please try again.")
        }
        return
      }

      // Registration successful — track analytics, then redirect to login with identifier (email or phone) and mark as new user
      const identifier = formData.email ? formData.email : (formData.phone ? formData.phone : '')
      const identifierType = formData.email ? 'email' : (formData.phone ? 'phone' : 'unknown')
      try {
        logEvent('register_success', { identifier: identifier || null, identifierType, method: 'credentials' })
      } catch (err) {
        // analytics failure should not block user flow
      }

      const query = identifier ? `&identifier=${encodeURIComponent(identifier)}&newUser=1` : '&newUser=1'
      router.push(`/login?registered=true${query}`)
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
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-gray-900 mb-2">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>MonAlo</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Begin your learning journey</p>
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
                label="Your name"
                type="text"
                placeholder="What should we call you?"
                helperText="This name will be shown on MonAlo"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={fieldErrors.name}
                disabled={isLoading}
                autoComplete="name"
                required
              />

              <Input
                label="Email address (optional)"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={fieldErrors.email}
                disabled={isLoading}
                autoComplete="email"
              />

              <Input
                label="Phone number (optional)"
                type="tel"
                placeholder="+1 555 555 5555"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={fieldErrors.phone}
                disabled={isLoading}
                autoComplete="tel"
              />

              

              <Input
                label="Password"
                type="password"
                placeholder="••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={fieldErrors.password}
                helperText="At least 6 characters"
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </FormSection>

            <FormActions>
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating your account...' : 'Create your account'}
              </Button>
            </FormActions>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => signIn('google', { callbackUrl: '/' })}
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
              onClick={() => signIn('facebook', { callbackUrl: '/' })}
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
              onClick={() => signIn('twitter', { callbackUrl: '/' })}
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

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Just a moment...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

