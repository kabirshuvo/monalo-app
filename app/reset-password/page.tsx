"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, FormSection, FormActions, Input, Button } from '@/components/ui'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormMessage('')
    if (newPassword.length < 6) {
      setFormMessage('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setFormMessage("Passwords don't match")
      return
    }

    setIsLoading(true)
    // Phase-1 placeholder: simulate update and redirect to login
    setTimeout(() => {
      setIsLoading(false)
      // Show success state instead of immediate redirect
      setSuccess(true)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Set a new password</h1>
          <p className="text-gray-600">Choose a new password for your account.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {!success ? (
            <Form onSubmit={handleSubmit}>
              <FormSection>
                <Input
                  label="New password"
                  type="password"
                  placeholder=""
                  helperText="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)}
                  required
                  autoComplete="new-password"
                />

                <Input
                  label="Confirm new password"
                  type="password"
                  placeholder=""
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
                  required
                  autoComplete="new-password"
                />
              </FormSection>

              {formMessage && (
                <div className="mb-4 text-center text-sm text-red-600">{formMessage}</div>
              )}

              <FormActions>
                <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                  Update password
                </Button>
              </FormActions>
            </Form>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Password updated</h2>
              <p className="text-gray-700 mb-6">Your password has been changed successfully.</p>
              <div className="max-w-xs mx-auto">
                <Button type="button" variant="primary" fullWidth onClick={() => router.push('/login')}>
                  Sign in
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
