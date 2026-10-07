"use client"

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { logEvent } from '@/lib/analytics'
import { clientSignOut } from '@/lib/auth/client-sign-out'
import { useAuthNav } from '@/lib/auth/use-auth-nav'
import AvatarVisual from '@/components/profile/AvatarVisual'
import { getUserAvatarFromSession } from '@/lib/auth/user-avatar'
import { ThemeToggle, InlineLoading } from '@/components/ui'
import Button from '@/components/ui/Button'
import TotalPointsBadge from '@/components/nav/TotalPointsBadge'
import SignInNavButton from '@/components/auth/SignInNavButton'
import StartTodayButton from '@/components/landing/StartTodayButton'
import SunMark from '@/components/cosmos/SunMark'
import PlanetOrb from '@/components/cosmos/PlanetOrb'

function AuthNavPlaceholder() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <div className="h-9 w-[4.5rem] rounded-lg border border-transparent" />
      <div className="h-9 w-[6.5rem] rounded-lg border border-transparent" />
    </div>
  )
}

export default function LandingHeaderClient() {
  const { session, isAuthenticated, isLoading } = useAuthNav()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const showSignedInNav = isAuthenticated && !signingOut

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayName = () => {
    const user = session?.user
    if (!user) return ''
    return user.name || user.email || ''
  }

  const handleLogout = async () => {
    setMenuOpen(false)
    setSigningOut(true)
    const start = typeof window !== 'undefined' ? sessionStorage.getItem('monalo_login_start') : null
    let minutes = 0
    if (start) {
      const ms = Date.now() - parseInt(start, 10)
      minutes = Math.max(0, Math.round(ms / 60000))
    }
    const email = session?.user?.email
    try {
      logEvent('logout', { minutes, email: email || null, method: 'signout' })
    } catch {}
    clientSignOut()
  }

  useEffect(() => {
    if (!showSignedInNav) setMenuOpen(false)
  }, [showSignedInNav])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--orbit-line)] cosmos-glass px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-content transition-opacity hover:opacity-85"
          aria-label="MonAlo, home"
        >
          <SunMark className="h-9 w-9" />
          <span className="font-serif text-[1.45rem] font-medium tracking-tight">MonAlo</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/learning"
            className="hidden items-center gap-2 rounded-full border border-[var(--orbit-line)] py-1.5 pl-1.5 pr-3.5 text-sm font-bold text-content-secondary transition-colors hover:border-[var(--orbit-line-strong)] hover:text-content sm:inline-flex"
          >
            <PlanetOrb planet="moon" size={16} />
            Eco Penguin
          </Link>
          <ThemeToggle />

          {!mounted ? (
            <AuthNavPlaceholder />
          ) : isLoading ? (
            <InlineLoading message="Loading..." />
          ) : signingOut ? null : showSignedInNav ? (
            <>
              <TotalPointsBadge />
              <Link href="/profile">
                <Button variant="secondary" size="sm">
                  Profile
                </Button>
              </Link>
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--sun)]"
                >
                  <AvatarVisual
                    value={getUserAvatarFromSession(session)}
                    name={displayName()}
                    size="sm"
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-[var(--orbit-line)] cosmos-glass py-1 shadow-2xl shadow-black/30">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-content-secondary hover:bg-[var(--surface-hover)] hover:text-content"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-content-secondary hover:bg-[var(--surface-hover)] hover:text-content"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/learning"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-content-secondary hover:bg-[var(--surface-hover)] hover:text-content"
                    >
                      Eco Penguin
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-content-secondary hover:bg-[var(--surface-hover)] hover:text-content"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <SignInNavButton />
              <StartTodayButton size="sm" />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
