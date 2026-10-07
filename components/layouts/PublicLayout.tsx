"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '../ui/Button'
import { useSession } from 'next-auth/react'
import { clientSignOut } from '@/lib/auth/client-sign-out'
import { useAuthNav } from '@/lib/auth/use-auth-nav'
// path-based UI logic removed: auth UI must not depend on pathname
import { logEvent } from '@/lib/analytics'
import { ThemeToggle, InlineLoading } from '@/components/ui'
import TotalPointsBadge from '@/components/nav/TotalPointsBadge'
import CartNavLink from '@/components/shop/CartNavLink'
import SignInNavButton from '@/components/auth/SignInNavButton'
import StartTodayButton from '@/components/landing/StartTodayButton'
import SunMark from '@/components/cosmos/SunMark'
import PlanetOrb from '@/components/cosmos/PlanetOrb'
import CosmosFooter from '@/components/cosmos/CosmosFooter'
import { planetForPath } from '@/lib/cosmos/planets'

export interface PublicLayoutProps {
  children: React.ReactNode
  currentPath?: string
}

const defaultNav = [
  { label: 'School', href: '/home' },
  { label: 'Learn', href: '/courses' },
  { label: 'Eco Penguin', href: '/learning' },
  { label: 'Shop', href: '/shop' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Team', href: '/team' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
]

const galleryNav = [
  { label: 'Gallery', href: '/' },
  { label: 'Monalo School', href: '/home' },
  { label: 'Eco Penguin', href: '/learning' },
  { label: 'Shop', href: '/shop' },
  { label: 'Contact', href: '/contact' },
]

const blogNav = [
  { label: 'Articles', href: '/' },
  { label: 'Monalo School', href: '/home' },
  { label: 'Learn', href: '/courses' },
  { label: 'Eco Penguin', href: '/learning' },
  { label: 'Contact', href: '/contact' },
]

function isSubdomainHost(prefix: string): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname.toLowerCase().startsWith(`${prefix}.`)
}

function isGalleryHost(): boolean {
  return isSubdomainHost('gallery')
}

function isBlogHost(): boolean {
  return isSubdomainHost('blog')
}

export default function PublicLayout({ children, currentPath = '' }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const { isAuthenticated: navAuthenticated } = useAuthNav()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const isLanding = currentPath === '/'
  const [onGalleryHost, setOnGalleryHost] = React.useState(false)
  const [onBlogHost, setOnBlogHost] = React.useState(false)
  React.useEffect(() => {
    setOnGalleryHost(isGalleryHost())
    setOnBlogHost(isBlogHost())
  }, [])
  const navigationItems = onGalleryHost ? galleryNav : onBlogHost ? blogNav : defaultNav
  const blogHome = onBlogHost
  const navPath =
    onBlogHost && (currentPath === '/blog' || currentPath.startsWith('/blog/')) ? '/' : currentPath
  const logoHref = status === 'authenticated' ? '/home' : '/'
  // Each page wears its planet's colours (Courses → Earth, Shop → Mars, …)
  const pageTone = planetForPath(navPath === '/' ? '' : navPath)?.id ?? 'sun'

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
    const map: Record<string, string> = {
      ADMIN: '/dashboard/admin',
      WRITER: '/dashboard/writer',
      LEARNER: '/dashboard/learning',
      CUSTOMER: '/dashboard/customer',
      SELLER: '/dashboard/seller',
    }
    if (role && map[role]) return map[role]
    if (status === 'authenticated') {
      const r = (session as { user?: { role?: string } })?.user?.role
      if (r && map[r]) return map[r]
    }
    return '/dashboard'
  }

  const handleLogout = async () => {
    setSigningOut(true)
    setMenuOpen(false)
    const start = sessionStorage.getItem('monalo_login_start')
    let minutes = 0
    if (start) {
      const ms = Date.now() - parseInt(start, 10)
      minutes = Math.max(0, Math.round(ms / 60000))
    }
    const email = navAuthenticated ? (session as { user?: { email?: string } })?.user?.email : undefined
    try {
      logEvent('logout', { minutes, email: email || null, method: 'signout' })
    } catch {}
    clientSignOut()
  }

  const displayName = () => {
    // Avoid touching session during loading/unauthenticated states
    if (status !== 'authenticated') return ''
    const user = (session as any)?.user
    if (!user) return ''
    return user.name || user.email || ''
  }

  // Centralized auth controls renderer to keep desktop and mobile in sync.
  const AuthControls = ({ variant }: { variant: 'desktop' | 'mobile' }) => {
    if (process.env.NODE_ENV === 'development') {
      try { console.log(`[NAVBAR AuthControls] variant=${variant} status=${status}`) } catch (e) {}
    }
    if (status === 'loading' || signingOut) {
      if (status === 'loading') {
        return variant === 'desktop' ? (
          <div className="hidden xl:flex items-center">
            <InlineLoading />
          </div>
        ) : (
          <InlineLoading className="w-full justify-center py-2" />
        )
      }
      return null
    }

    if (navAuthenticated && status === 'authenticated') {
      // Authenticated UI
      if (variant === 'desktop') {
        return (
          <div className="hidden xl:flex items-center gap-3 relative">
            <TotalPointsBadge />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sun)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--orbit-line-strong)] bg-[var(--surface)]">
                <span className="font-serif text-base text-content">
                  {String(((session as any)?.user?.name || (session as any)?.user?.email || '')).charAt(0).toUpperCase()}
                </span>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-[var(--orbit-line)] cosmos-glass py-1 shadow-2xl shadow-black/30">
                <Link href={getDashboardPath((session as any)?.user?.role)} className="block px-4 py-2 text-sm text-content-secondary hover:bg-[var(--surface-hover)] hover:text-content">Dashboard</Link>
                <Link href="/profile" className="block px-4 py-2 text-sm text-content-secondary hover:bg-[var(--surface-hover)] hover:text-content">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-content-secondary hover:bg-[var(--surface-hover)] hover:text-content">Sign out</button>
              </div>
            )}
          </div>
        )
      }

      // Mobile authenticated actions (rendered inside mobile nav container)
      return (
        <>
          <TotalPointsBadge className="w-full justify-center" />
          <Link href={getDashboardPath((session as any)?.user?.role)}>
            <Button variant="secondary" size="sm" fullWidth>
              Dashboard
            </Button>
          </Link>
          <button onClick={handleLogout} className="w-full text-left">
            <Button variant="ghost" size="sm" fullWidth>
              Sign out
            </Button>
          </button>
        </>
      )
    }

    // Unauthenticated UI — no sign-out; Sign in + Start today trigger auth
    if (variant === 'desktop') {
      return (
        <div className="hidden xl:flex items-center gap-3 relative">
          <SignInNavButton />
          <StartTodayButton size="sm" />
        </div>
      )
    }

    return (
      <>
        <SignInNavButton fullWidth />
        <StartTodayButton size="sm" fullWidth />
      </>
    )
  }

  return (
    // TEMP DIAGNOSTIC: force remount when `status` changes to verify
    // whether remounting fixes navbar staleness. Remove when debugging is done.
    <div
      key={status}
      data-tone={pageTone}
      className={`min-h-screen flex flex-col text-[var(--foreground)] ${pageTone ? 'tone-wash' : ''}`}
    >
      {/* Header */}
      <header className="cosmos-glass sticky top-0 z-40 border-b border-[var(--orbit-line)]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href={blogHome ? '/' : logoHref}
              className="flex items-center gap-2.5 text-content transition-opacity hover:opacity-85"
              aria-label="MonAlo, home"
            >
              <SunMark className="h-9 w-9" />
              <span className="font-serif text-[1.4rem] font-medium tracking-tight">MonAlo</span>
            </Link>

            {/* Desktop Navigation */}
            {!isLanding && (
              <div className="hidden xl:flex items-center gap-0.5">
              {navigationItems.map((item) => (
                <NavItem key={item.href} href={item.href} label={item.label} active={navPath === item.href} />
              ))}
              </div>
            )}

            {/* Theme + Auth (desktop) */}
            {!isLanding && (
              <div className="hidden xl:flex items-center gap-2">
                <CartNavLink />
                <ThemeToggle />
                <AuthControls variant="desktop" />
              </div>
            )}

            {/* Mobile menu button */}
            {!isLanding && (
              <div className="xl:hidden flex items-center gap-2">
                <CartNavLink />
                <ThemeToggle />
                <button
                  type="button"
                  className="rounded-full p-2 text-content-secondary transition-colors hover:bg-[var(--surface-hover)] hover:text-content"
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
            )}
          </div>

          {/* Mobile Navigation */}
          {!isLanding && mobileMenuOpen && (
            <div className="xl:hidden border-t border-[var(--orbit-line)] py-4">
              <div className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    active={navPath === item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    block
                  />
                ))}
                <div className="mt-2 flex flex-col gap-2 border-t border-[var(--orbit-line)] pt-4">
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

      <CosmosFooter />
    </div>
  )
}

function NavItem({
  href,
  label,
  active,
  onClick,
  block = false,
}: {
  href: string
  label: string
  active: boolean
  onClick?: () => void
  block?: boolean
}) {
  const planet = planetForPath(href === '/' ? '' : href)
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`${block ? 'flex' : 'inline-flex'} items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors ${
        active
          ? 'bg-[var(--tone-soft)] text-content ring-1 ring-[var(--tone-line)]'
          : 'text-content-secondary hover:bg-[var(--surface-hover)] hover:text-content'
      }`}
    >
      {planet ? <PlanetOrb planet={planet} size={9} /> : null}
      {label}
    </Link>
  )
}
