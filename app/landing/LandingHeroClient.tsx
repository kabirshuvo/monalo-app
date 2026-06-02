"use client"
import React from 'react'
import welcomeMessages from '../../welcomeMessages.json'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

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
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 dark:text-zinc-50">
              Welcome back.
            </h1>
            <p className="text-lg text-gray-600 dark:text-zinc-300">
              Continue where you left off — one calm step at a time.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" onClick={() => router.push(getDashboardPath())}>
                Continue journey
              </Button>
              <Link href="/courses">
                <Button variant="secondary" size="lg">
                  Browse courses
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 p-6 sm:p-8">
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
              Tip: if you ever feel stuck, pick the smallest lesson you can finish in 10 minutes.
              Momentum builds quietly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left: message + CTA */}
        <div className="space-y-6 text-left">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 dark:text-zinc-50 leading-tight tracking-tight">
            A calm place to learn, create, and grow.
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-zinc-300 leading-relaxed font-normal">
            MonAlo is a quiet digital space for learning, craft, and thoughtful work — built to feel human, not hurried.
          </p>
          {welcome && (
            <p className="text-base text-gray-700 dark:text-zinc-200 italic">{welcome}</p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-start gap-3">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Get started
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="secondary" size="lg">
                Browse courses
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-zinc-400">
            No pressure. No rush. Just progress you can feel.
          </p>
        </div>

        {/* Right: supporting surface */}
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                <span className="text-base font-semibold">M</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">A gentle routine</p>
                <p className="text-sm text-gray-600 dark:text-zinc-300">Small steps, steady growth.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">Learn</p>
                <p className="text-sm text-gray-600 dark:text-zinc-300">Courses built for real life.</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">Create</p>
                <p className="text-sm text-gray-600 dark:text-zinc-300">Share your work thoughtfully.</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">Grow</p>
                <p className="text-sm text-gray-600 dark:text-zinc-300">Track your journey calmly.</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">Collect</p>
                <p className="text-sm text-gray-600 dark:text-zinc-300">Shop and support creators.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
