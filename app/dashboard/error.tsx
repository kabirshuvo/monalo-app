"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

/**
 * Dashboard Error Boundary
 * 
 * Handles errors within the dashboard without breaking the entire app.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-center">Dashboard hiccup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center text-sm">
            We couldn't load this part of your dashboard. Your data is safe—let's get you back on track.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={reset} fullWidth>
              Try loading again
            </Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')} fullWidth>
              Back to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
