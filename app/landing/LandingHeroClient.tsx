"use client"
import Link from 'next/link'
import { useAuthNav } from '@/lib/auth/use-auth-nav'
import Button from '@/components/ui/Button'
import SolarSystem from '@/components/cosmos/SolarSystem'

export default function LandingHeroClient() {
  const { isAuthenticated } = useAuthNav()

  const copy = isAuthenticated ? (
    <div className="max-w-xl">
      <h1 className="text-[clamp(2.6rem,6vw,4.4rem)] font-normal leading-[1.02] tracking-[-0.025em] text-content">
        Welcome back to orbit.
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-content-secondary sm:text-xl">
        Pick up where you left off, or point at a planet to visit another part of the school.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="/learning">
          <Button variant="primary" size="lg">
            Open Eco Penguin
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="secondary" size="lg">
            Your profile
          </Button>
        </Link>
      </div>
    </div>
  ) : (
    <div className="max-w-xl">
      <h1 className="text-[clamp(2.6rem,6.2vw,4.75rem)] font-normal leading-[1.02] tracking-[-0.025em] text-content">
        Little readers start&nbsp;here.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-content-secondary sm:text-xl">
        Eco Penguin teaches phonics through short, playful games: letter sounds, blending and
        stories. Made by Monalo School, so every little win also helps a student learn.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="/learning/letter-sounds">
          <Button variant="primary" size="lg">
            Try Eco Penguin free
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary" size="lg">
            Create a free account
          </Button>
        </Link>
      </div>
      <p className="mt-4 text-sm text-content-muted">
        No account needed to try letter sounds and rhyme time.
      </p>
    </div>
  )

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:px-8 lg:pb-24">
      <SolarSystem>{copy}</SolarSystem>
    </div>
  )
}
