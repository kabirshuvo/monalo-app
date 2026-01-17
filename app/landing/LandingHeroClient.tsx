"use client"
import React from 'react'
import welcomeMessages from '../../welcomeMessages.json'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LandingHeroClient() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const router = useRouter()

  const welcome = React.useMemo(() => {
    try {
      if (!Array.isArray(welcomeMessages) || welcomeMessages.length === 0) return null
      return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
    } catch {
      return null
    }
  }, [])

  const getDashboardPath = () => {
    const role = (session as any)?.user?.role
    if (!role) return '/dashboard'
    return `/dashboard/${(role as string).toLowerCase()}`
  }

  if (isAuthenticated) {
    return (
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h2 className="text-4xl font-medium text-gray-900">Welcome back</h2>
        <p className="text-lg text-gray-600">Continue where you left off.</p>
        <div className="pt-6">
          <button
            onClick={() => router.push(getDashboardPath())}
            className="px-8 py-3 bg-blue-600 text-white rounded-md"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl w-full space-y-12 lg:space-y-16">
      {/* Hero Headline & Subtext (same as before) */}
      <div className="space-y-8 text-center">
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 leading-tight tracking-tight">
          A calm place to learn, create, and grow.
        </h2>
        <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-normal max-w-2xl mx-auto">
          MonAlo is a quiet digital space for learning, craft, and thoughtful work — built to feel human, not hurried.
        </p>
        {welcome && (
          <p className="mt-4 text-md text-gray-700 italic max-w-2xl mx-auto">{welcome}</p>
        )}
      </div>

      {/* Primary CTA + Secondary Link */}
      <div className="flex flex-col sm:flex-row items-start gap-6 pt-8 justify-center">
        <Link href="/courses">
          <button className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-md">Explore MonAlo</button>
        </Link>
        <Link href="/home" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <span className="text-base font-normal">Learn how it works</span>
          <span className="ml-2">→</span>
        </Link>
      </div>
    </div>
  )
}
