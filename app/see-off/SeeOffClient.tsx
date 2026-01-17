"use client"
import React, { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function SeeOffClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { status } = useSession()

  // If user is authenticated, redirect away (see-off only for logged-out users)
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status, router])

  const minutes = searchParams?.get('minutes') || ''
  const email = searchParams?.get('email') || ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">You’ve been logged out</h1>
        <p className="text-gray-700 mb-6">Thanks for spending time with MonAlo 💛</p>

        {minutes !== '' && (
          <p className="text-gray-600 mb-6">You spent {minutes} minute{Number(minutes) === 1 ? '' : 's'} on MonAlo today.</p>
        )}

        <div className="flex items-center justify-center gap-4">
          <Link href={email ? `/login?email=${encodeURIComponent(email)}` : '/login'}>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md">Enter again</button>
          </Link>
          <Link href="/">
            <button className="px-6 py-3 bg-white border border-gray-200 rounded-md">Back to landing</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
