'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

/**
 * Eco Penguin error boundary: points the child (or grown-up) at the next useful step
 * depending on whether they are signed in.
 */
export default function LearningError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { status } = useSession()
  const pathname = usePathname() ?? '/learning'

  useEffect(() => {
    console.error('Eco Penguin error:', error)
  }, [error])

  const signedOut = status === 'unauthenticated'
  const loginHref = `/login?from=ecopenguin&callbackUrl=${encodeURIComponent(pathname)}`

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 text-center text-5xl" aria-hidden>
            🐧
          </div>
          <CardTitle className="text-center">
            {signedOut ? 'Please sign in to keep playing' : 'The penguin tripped over something'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-content-muted">
            {signedOut
              ? 'Your session may have ended. Sign in again and your stars and stickers will be right where you left them.'
              : "That didn't load. Your progress is safe. Try again, or head back to the Eco Penguin hub."}
          </p>

          {error.digest ? (
            <p className="text-center text-xs text-content-muted">
              Error ID (for support): <code className="font-mono">{error.digest}</code>
            </p>
          ) : null}

          <div className="flex flex-col gap-3 pt-2">
            {signedOut ? (
              <a href={loginHref} className="contents">
                <Button fullWidth>Sign in</Button>
              </a>
            ) : (
              <Button onClick={reset} fullWidth>
                Try again
              </Button>
            )}
            <Link href="/learning" className="contents">
              <Button variant="secondary" fullWidth>
                {signedOut ? 'Try the free rooms' : 'Back to Eco Penguin'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
