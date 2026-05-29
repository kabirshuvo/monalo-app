import Link from 'next/link'
import { verifyEmailByToken } from '@/lib/auth/verification'

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <VerifyEmailShell
        title="Missing verification link"
        message="This verification link is incomplete. Check your inbox for the latest email from MonAlo."
        variant="error"
      />
    )
  }

  const result = await verifyEmailByToken(token)

  if (!result.ok) {
    const messages: Record<typeof result.error, { title: string; message: string }> = {
      missing: {
        title: 'Missing verification link',
        message: 'This verification link is incomplete.',
      },
      invalid: {
        title: 'Invalid verification link',
        message: 'This link is not valid. It may have already been used.',
      },
      expired: {
        title: 'Verification link expired',
        message: 'This link has expired. Register again or contact support for a new email.',
      },
      not_found: {
        title: 'Account not found',
        message: 'We could not find an account for this verification link.',
      },
    }

    const copy = messages[result.error]

    return (
      <VerifyEmailShell title={copy.title} message={copy.message} variant="error" />
    )
  }

  return (
    <VerifyEmailShell
      title="Email verified"
      message={`Your email ${result.email} is verified. You can now sign in to MonAlo.`}
      variant="success"
      showLogin
    />
  )
}

function VerifyEmailShell({
  title,
  message,
  variant,
  showLogin = false,
}: {
  title: string
  message: string
  variant: 'success' | 'error'
  showLogin?: boolean
}) {
  const isSuccess = variant === 'success'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-gray-900 mb-2">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>MonAlo</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isSuccess ? (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          {showLogin ? (
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continue to sign in
            </Link>
          ) : (
            <div className="space-y-3">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create an account
              </Link>
              <Link href="/login" className="block text-sm text-blue-600 hover:text-blue-700">
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
