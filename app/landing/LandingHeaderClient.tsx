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

export default function LandingHeaderClient() {
  const { session, isAuthenticated, isLoading } = useAuthNav()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const showSignedInNav = isAuthenticated && !signingOut

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
    <header className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-zinc-50 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
        >
          <svg className="w-8 h-8 text-gray-900 dark:text-zinc-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span>MonAlo</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isLoading ? (
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
                  className="flex items-center rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <AvatarVisual
                    value={getUserAvatarFromSession(session)}
                    name={displayName()}
                    size="sm"
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900"
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
