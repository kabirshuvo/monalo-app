"use client"
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

export default function ForgotPasswordPage() {
  const router = useRouter()

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
          <p className="text-gray-600">No worries — it happens to all of us.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <p className="text-gray-900 text-lg font-medium mb-4">Password recovery is coming soon.</p>

          <p className="text-sm text-gray-600 mb-6">
            We’re currently working on a secure way to reset your password.
            For now, please try signing in again.
          </p>

          <div className="mt-4">
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={() => router.push('/login')}
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
