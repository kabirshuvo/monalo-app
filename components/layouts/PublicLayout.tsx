"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '../ui/Button'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const isAuthenticated = status === 'authenticated'
  const [menuOpen, setMenuOpen] = useState(false)

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

  const getDashboardPath = () => {
    const role = (session as any)?.user?.role
    if (!role) return '/dashboard/customer'
    return `/dashboard/${(role as string).toLowerCase()}`
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
    const email = (session as any)?.user?.email
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : ''
    try {
      logEvent('logout', { minutes, email: email || null, method: 'signout' })
    } catch {}
    await signOut({ callbackUrl: `/see-off?minutes=${minutes}${emailParam}` })
  }

  const displayName = () => {
    const user = (session as any)?.user
    if (!user) return ''
    return user.name || user.email || ''
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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

            {/* Auth Buttons / Avatar */}
            <div className="hidden md:flex items-center gap-3 relative">
              {status === 'loading' ? (
                // Minimal UI while session is loading
                <>
                  <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                </>
              ) : isAuthenticated ? (
                <>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                    className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {displayName().charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {/* Welcome message on landing page only */}
                  {pathname === '/' && (
                    <div className="ml-3 text-sm text-gray-700">Welcome, {displayName()}</div>
                  )}

                  {menuOpen && (
                    <div className="absolute right-0 mt-12 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                      <Link href={getDashboardPath()} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
                    </div>
                  )}
                </>
                  ) : (
                <>
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
                </>
              )}
            </div>

            {/* Mobile menu button */}
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
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
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
                  {status === 'loading' ? (
                    <>
                      <div className="h-10 bg-gray-200 rounded-md animate-pulse" />
                      <div className="h-10 bg-gray-200 rounded-md animate-pulse" />
                    </>
                  ) : isAuthenticated ? (
                    <>
                      <Link href={getDashboardPath()}>
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
                  ) : (
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
                  )}
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
