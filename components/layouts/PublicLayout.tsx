"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '../ui/Button'
import { useSession, signOut } from 'next-auth/react'
// path-based UI logic removed: auth UI must not depend on pathname
import { logEvent } from '@/lib/analytics'

export interface PublicLayoutProps {
  children: React.ReactNode
  currentPath?: string
}

const navigationItems = [
  { label: 'Home', href: '/home' },
  { label: 'Courses', href: '/courses' },
  { label: 'Shop', href: '/shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
]

export default function PublicLayout({ children, currentPath = '' }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const isLanding = currentPath === '/'

  // Diagnostic helpers (development only)
  const _devUserEmail = (session as any)?.user?.email ?? null
  const renderCountRef = React.useRef(0)
  renderCountRef.current += 1
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('[NAVBAR RENDER]', { count: renderCountRef.current, status, email: _devUserEmail, isLanding })
    } catch (e) {}
  }

  /*
   Auth UI notes:
   - Drive UI from `status` only: `status` (loading/authenticated/unauthenticated)
     represents the auth lifecycle and avoids transient rendering when the
     session object is not yet available.
   - Do NOT rely on `session` truthiness: reading `session` directly can
     produce race conditions or stale UI (session may be null during
     loading or immediately after sign-out in another tab).
   - Reset menu state on auth transitions to close ephemeral UI so dropdowns
     or mobile menus don't remain open after login/logout (prevents stale
     interactive controls that no longer apply).
  */

  // Ensure we record login start time for session-based analytics
  useEffect(() => {
    if (status === 'authenticated') {
      if (!sessionStorage.getItem('monalo_login_start')) {
        sessionStorage.setItem('monalo_login_start', Date.now().toString())
      }
    }
    if (status === 'unauthenticated') {
      // Clear any stale login start when signed out in another tab
      sessionStorage.removeItem('monalo_login_start')
    }
  }, [status])

  // Reset ephemeral UI (menus) on auth-state changes to avoid stale guest/auth UI
  useEffect(() => {
    // Close any open menus when the auth status changes to avoid showing
    // stale guest/auth UI after login or logout.
    if (menuOpen) setMenuOpen(false)
    if (mobileMenuOpen) setMobileMenuOpen(false)
  }, [status])

  // Dev-only logging to observe navbar auth transitions (status/email)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('[NAVBAR]', { status, email: _devUserEmail })
      } catch (e) {}
    }
  }, [status, _devUserEmail])

  const getDashboardPath = (role?: string) => {
    // If a role is provided, use it. Otherwise, only attempt to read the
    // session for a role when we're authenticated to avoid touching session
    // data during loading/unauthenticated states.
    if (role) return `/dashboard/${role.toLowerCase()}`
    if (status === 'authenticated') {
      const roleFromSession = (session as any)?.user?.role
      if (roleFromSession) return `/dashboard/${roleFromSession.toLowerCase()}`
    }
    return '/dashboard/customer'
  }

  const handleLogout = async () => {
    // Compute session duration
    const start = sessionStorage.getItem('monalo_login_start')
    let minutes = 0
    if (start) {
      const ms = Date.now() - parseInt(start, 10)
      minutes = Math.max(0, Math.round(ms / 60000))
    }
    // Clear start time
    sessionStorage.removeItem('monalo_login_start')

    // Sign out and redirect to see-off with minutes
    // Only read session user data if we're authenticated
    const email = status === 'authenticated' ? (session as any)?.user?.email : undefined
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : ''
    try {
      logEvent('logout', { minutes, email: email || null, method: 'signout' })
    } catch {}
    await signOut({ callbackUrl: `/see-off?minutes=${minutes}${emailParam}` })
  }

  const displayName = () => {
    // Avoid touching session during loading/unauthenticated states
    if (status !== 'authenticated') return ''
    const user = (session as any)?.user
    if (!user) return ''
    return user.name || user.email || user.phone || ''
  }

  // Helper to get user's initial for avatar
  const getUserInitial = () => {
    if (status !== 'authenticated') return ''
    const user = (session as any)?.user
    if (!user) return ''
    const name = user.name || user.email || user.phone || ''
    return name.charAt(0).toUpperCase()
  }

  // Centralized auth controls renderer to keep desktop and mobile in sync.
  const AuthControls = ({ variant }: { variant: 'desktop' | 'mobile' }) => {
    if (process.env.NODE_ENV === 'development') {
      try { console.log(`[NAVBAR AuthControls] variant=${variant} status=${status}`) } catch (e) {}
    }
    if (status === 'loading') return null

    if (status === 'authenticated') {
      // Authenticated UI
      if (variant === 'desktop') {
        return (
          <div className="hidden md:flex items-center gap-3 relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {getUserInitial()}
                </span>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-12 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                <Link href={getDashboardPath((session as any)?.user?.role)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
              </div>
            )}
          </div>
        )
      }

      // Mobile authenticated actions (rendered inside mobile nav container)
      return (
        <>
          <Link href={getDashboardPath((session as any)?.user?.role)}>
            <Button variant="secondary" size="sm" fullWidth>
              Dashboard
            </Button>
          </Link>
          <button onClick={handleLogout} className="w-full text-left">
            <Button variant="ghost" size="sm" fullWidth>
              Logout
            </Button>
          </button>
        </>
      )
    }

    // Unauthenticated UI
    if (variant === 'desktop') {
      return (
        <div className="hidden md:flex items-center gap-3 relative">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <>
        <Link href="/login">
          <Button variant="ghost" size="sm" fullWidth>
            Log in
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="primary" size="sm" fullWidth>
            Get Started
          </Button>
        </Link>
      </>
    )
  }

  return (
    // TEMP DIAGNOSTIC: force remount when `status` changes to verify
    // whether remounting fixes navbar staleness. Remove when debugging is done.
    <div key={status} className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>MonAlo</span>
            </Link>

            {/* Desktop Navigation */}
            {!isLanding && (
              <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${currentPath === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              </div>
            )}

            {/* Auth Buttons / Avatar - render exactly one branch per status */}
            {!isLanding && <AuthControls variant="desktop" />}

            {/* Mobile menu button */}
            {!isLanding && (
              <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          {!isLanding && mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${currentPath === item.href
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200 mt-2 flex flex-col gap-2">
                  <AuthControls variant="mobile" />
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>MonAlo</span>
              </div>
              <p className="text-gray-600 text-sm max-w-md">
                Light of the mind. Illuminating your path to knowledge through learning, creating, and growing together.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><Link href="/courses" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Courses</Link></li>
                <li><Link href="/shop" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Shop</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} MonAlo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
