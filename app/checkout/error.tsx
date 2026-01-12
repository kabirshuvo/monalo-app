"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui'

/**
 * Checkout Error Boundary
 * 
 * Handles checkout errors with extra care—cart data is preserved.
 */
export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Checkout error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent>
          <div className="text-center space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Checkout paused
              </h2>
              <p className="text-gray-600 text-sm">
                Your cart is safe. We hit a snag completing your order. Let's try once more.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={reset} fullWidth>
                Try checkout again
              </Button>
              <Button variant="secondary" onClick={() => router.push('/shop')} fullWidth>
                Back to shop
              </Button>
            </div>

            <p className="text-xs text-gray-500 pt-2">
              Your cart items are still there—nothing was charged.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
