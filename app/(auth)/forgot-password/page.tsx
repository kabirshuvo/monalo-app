"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Form, FormSection, FormActions, Input, Button } from '@/components/ui'
import { logEvent } from '@/lib/analytics'
import { validateEmail } from '@/lib/validators'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [didTrack, setDidTrack] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormMessage('')
    setIsLoading(true)

    // Track password reset request once per submission (no PII)
    if (!didTrack) {
      try {
        const trimmed = identifier.trim()
        const method = validateEmail(trimmed) ? 'email' : (trimmed ? 'phone' : 'email')
        logEvent('password_reset_requested', { method, timestamp: new Date().toISOString() })
      } catch (err) {
        // analytics must not block UX
      }
      setDidTrack(true)
    }
    // Phase-1 placeholder: simulate send and show confirmation message
    setTimeout(() => {
      setIsLoading(false)
      setFormMessage('If an account exists, we’ll send a reset link to that address.')
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-gray-900 mb-2">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>MonAlo</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
          <p className="text-gray-600">We’ll help you reset it.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <Form onSubmit={handleSubmit}>
            <FormSection>
              <Input
                label="Email or phone number"
                type="text"
                placeholder="Enter your email or phone number"
                helperText={"We’ll send you a password reset link"}
                value={identifier}
                onChange={(e) => setIdentifier((e.target as HTMLInputElement).value)}
                required
                autoComplete="username"
              />
            </FormSection>

            {formMessage && (
              <div className="mb-4 text-center text-sm text-green-600">{formMessage}</div>
            )}

            <FormActions>
              <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                Send reset link
              </Button>
            </FormActions>
          </Form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
