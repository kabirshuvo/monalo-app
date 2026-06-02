"use client"
//LandingHeaderClient.tsx 
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { logEvent } from '@/lib/analytics'
import AvatarVisual from '@/components/profile/AvatarVisual'
import { getUserAvatarFromSession } from '@/lib/auth/user-avatar'
import { ThemeToggle } from '@/components/ui'
import Button from '@/components/ui/Button'

export default function LandingHeaderClient() {
  const pathname = usePathname()

  // When on the root landing page, render only the logo — no auth checks
  if (pathname === '/') {
    return (
      <header className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-zinc-50 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors">
            <svg className="w-8 h-8 text-gray-900 dark:text-zinc-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>MonAlo</span>
          </Link>

          {/* Root landing: lightweight controls (no auth checks) */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const displayName = () => {
    const user = (session as any)?.user
    if (!user) return ''
    return user.name || user.email || ''
  }
  const user = (session as any)?.user

  const handleLogout = async () => {
    setMenuOpen(false)
    // compute minutes for see-off (analytics only)
    const start = typeof window !== 'undefined' ? sessionStorage.getItem('monalo_login_start') : null
    let minutes = 0
    if (start) {
      const ms = Date.now() - parseInt(start, 10)
      minutes = Math.max(0, Math.round(ms / 60000))
    }
    if (typeof window !== 'undefined') sessionStorage.removeItem('monalo_login_start')
    const email = (session as any)?.user?.email
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : ''
    try {
      logEvent('logout', { minutes, email: email || null, method: 'signout' })
    } catch {}
    await signOut({ callbackUrl: `/see-off?minutes=${minutes}${emailParam}` })
  }

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
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-zinc-50 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors">
          <svg className="w-8 h-8 text-gray-900 dark:text-zinc-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>MonAlo</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div ref={menuRef}>
          {isAuthenticated ? (
            <div className="relative inline-block text-left">
              <button
                onClick={() => setMenuOpen((s) => !s)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <AvatarVisual
                  value={getUserAvatarFromSession(session)}
                  name={displayName()}
                  size="sm"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-50">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900">Profile</Link>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900">Dashboard</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  )
}
