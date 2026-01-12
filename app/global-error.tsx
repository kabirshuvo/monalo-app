"use client"
import { useEffect } from 'react'

/**
 * Global Error Boundary (Root Level)
 * 
 * Handles critical errors that affect the entire application,
 * including errors in the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Critical app error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 text-center mb-3">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              We encountered an unexpected issue. Please refresh the page or try again in a moment.
            </p>

            {error.digest && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
                <p className="text-xs text-gray-500 mb-1">Error ID</p>
                <code className="text-xs font-mono text-gray-700">{error.digest}</code>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go to homepage
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center mt-6">
              Need help?{' '}
              <a href="/contact" className="text-blue-600 hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
