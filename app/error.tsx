"use client"
import { useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

/**
 * Global Error Boundary
 * 
 * Catches unhandled errors in the app with a calm, friendly fallback.
 * No stack traces or technical jargon—just clear guidance.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-center">Something unexpected happened</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            We ran into a small issue. Don't worry—your progress is safe, and this is likely temporary.
          </p>

          {error.digest && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Error ID (for support)</p>
              <code className="text-xs font-mono text-gray-700">{error.digest}</code>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={reset} fullWidth>
              Try again
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = '/'} fullWidth>
              Return to home
            </Button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            If this keeps happening, please{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              let us know
            </a>
            . We're here to help.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
