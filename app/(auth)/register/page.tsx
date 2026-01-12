"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Form, FormSection, FormActions, Input, Button, Alert, Select } from '@/components/ui'

function RegisterForm() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const status = sessionData?.status
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER'
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
      errors.name = 'Please enter your name.'
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Please choose a username.'
    } else if (formData.username.length < 3) {
      errors.username = 'Your username needs at least 3 characters.'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, dashes, and underscores.'
    }
    
    if (!formData.email) {
      errors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "This email address doesn't look quite right."
    }
    
    if (!formData.password) {
      errors.password = 'Please create a password.'
    } else if (formData.password.length < 8) {
      errors.password = 'Your password needs at least 8 characters.'
    } else if (formData.password.length > 128) {
      errors.password = 'Your password is too long. Please use fewer than 128 characters.'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Your password needs at least one uppercase letter, one lowercase letter, and one number.'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "These passwords don't match."
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
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases with gentle messages
        if (response.status === 409) {
          if (data.message?.includes('email')) {
            setFieldErrors(prev => ({ ...prev, email: 'This email is already registered.' }))
          } else if (data.message?.includes('username')) {
            setFieldErrors(prev => ({ ...prev, username: 'This username is already taken.' }))
          } else {
            setError('An account with these details already exists.')
          }
        } else if (response.status === 400) {
          setError('Please check your information and try again.')
        } else {
          setError("We couldn't create your account right now. Please try again.")
        }
        return
      }

      // Registration successful, sign in automatically
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
      } else {
        // Registration succeeded but auto-login failed
        router.push('/login?registered=true')
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
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={fieldErrors.name}
                disabled={isLoading}
                autoComplete="name"
                required
              />

              <Input
                label="Username"
                type="text"
                placeholder="janedoe"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                error={fieldErrors.username}
                helperText="This will be your unique identifier"
                disabled={isLoading}
                autoComplete="username"
                required
              />

              <Input
                label="Email address"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={fieldErrors.email}
                disabled={isLoading}
                autoComplete="email"
                required
              />

              <Select
                label="I'm here to"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                options={[
                  { value: 'CUSTOMER', label: 'Shop for products' },
                  { value: 'LEARNER', label: 'Learn and grow' },
                  { value: 'WRITER', label: 'Share my knowledge' }
                ]}
                disabled={isLoading}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={fieldErrors.password}
                helperText="At least 8 characters with uppercase, lowercase, and a number"
                disabled={isLoading}
                autoComplete="new-password"
                required
              />

              <Input
                label="Confirm password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={fieldErrors.confirmPassword}
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

