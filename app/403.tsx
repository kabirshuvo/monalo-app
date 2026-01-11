import Link from 'next/link'

/**
 * 403 Forbidden Page
 * 
 * Shown when a user tries to access a route they don't have permission for
 */
export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forbidden</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this resource. Your role does not grant you access to this area.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            <strong>Why are you seeing this?</strong>
            <br />
            This page is restricted to users with specific roles. Please log in with an account that has the appropriate permissions.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/home"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Log in with Different Account
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          If you believe this is a mistake, please contact support.
        </p>
      </div>
    </main>
  )
}
