"use client"
import React from 'react'
import welcomeMessages from '../../welcomeMessages.json'
import Link from 'next/link'
import { useAuthNav } from '@/lib/auth/use-auth-nav'
import Button from '@/components/ui/Button'
import StartTodayButton from '@/components/landing/StartTodayButton'
import { SoftReveal } from '@/components/motion/SoftReveal'
import { LandingHeroMotion } from '@/components/landing/LandingHeroMotion'

export default function LandingHeroClient() {
  const { isAuthenticated } = useAuthNav()

  const welcome = React.useMemo(() => {
    try {
      if (!Array.isArray(welcomeMessages) || welcomeMessages.length === 0) return null
      return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
    } catch {
      return null
    }
  }, [])

  const copy = isAuthenticated ? (
    <SoftReveal lines variant="up" className="pointer-events-auto w-full max-w-2xl space-y-5 text-left">
      <h1 className="text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl dark:text-zinc-50">
        Welcome back.
      </h1>
      <p className="text-lg text-gray-600 dark:text-zinc-300">
        You&apos;re signed in — visit your profile or head to the MonAlo home page.
      </p>
      <div className="flex flex-col items-start gap-3 pt-4 sm:flex-row">
        <Link href="/profile">
          <Button variant="primary" size="lg" className="gallery-soft-cta">
            Your profile
          </Button>
        </Link>
        <Link href="/home">
          <Button variant="secondary" size="lg" className="gallery-soft-cta">
            Home
          </Button>
        </Link>
      </div>
    </SoftReveal>
  ) : (
    <SoftReveal lines variant="up" className="pointer-events-auto w-full max-w-3xl space-y-6 text-left">
      <h1 className="text-5xl font-light leading-tight tracking-tight text-gray-900 sm:text-6xl lg:text-7xl dark:text-zinc-50">
        A calm place to learn, create, and grow.
      </h1>
      <p className="text-xl font-normal leading-relaxed text-gray-600 sm:text-2xl dark:text-zinc-300">
        MonAlo is a quiet digital space for learning, craft, and thoughtful work — built to feel
        human, not hurried.
      </p>
      {welcome ? (
        <p className="text-base italic text-gray-700 dark:text-zinc-200">{welcome}</p>
      ) : null}

      <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row">
        <StartTodayButton />
        <Link href="/home">
          <Button variant="secondary" size="lg" className="gallery-soft-cta">
            Home
          </Button>
        </Link>
      </div>

      <p className="text-sm text-gray-500 dark:text-zinc-400">
        No pressure. No rush. Just progress you can feel.
      </p>
    </SoftReveal>
  )

  return (
    <div
      className="relative min-h-[calc(100vh-3.5rem)] w-full overflow-hidden sm:min-h-[calc(100vh-4rem)]"
      data-landing-hero
    >
      <LandingHeroMotion />
      {/* pointer-events-none so planets/moon/sun on the right stay hoverable */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-6xl items-center px-4 py-6 sm:min-h-[calc(100vh-4rem)] sm:px-6 sm:py-8 lg:px-8">
        {copy}
      </div>
    </div>
  )
}
