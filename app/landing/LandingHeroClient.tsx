"use client"
import Link from 'next/link'
import { useAuthNav } from '@/lib/auth/use-auth-nav'
import Button from '@/components/ui/Button'
import StartTodayButton from '@/components/landing/StartTodayButton'
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
        The whole school, in&nbsp;orbit.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-content-secondary sm:text-xl">
        <em className="font-serif not-italic text-content">MonAlo</em> means light of the mind. The
        school is the sun; around it turn courses, phonics games for young readers, a craft shop, a
        gallery and a freelance team. Every planet you visit helps keep students learning.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <StartTodayButton />
        <Link href="/home">
          <Button variant="secondary" size="lg">
            Visit the school
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:px-8 lg:pb-24">
      <SolarSystem>{copy}</SolarSystem>
    </div>
  )
}
