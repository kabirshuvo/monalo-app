import { NextRequest, NextResponse } from 'next/server'

export type MonaloSite = 'gallery' | 'shop' | 'learn' | 'blog' | 'team' | 'ecopenguin'

type SiteConfig = {
  id: MonaloSite
  hosts: string[]
  basePath: string
  /** On subdomain, map bare paths to basePath (e.g. /slug → /gallery/slug) */
  rootOnSubdomain: boolean
}

export const SITE_CONFIGS: SiteConfig[] = [
  {
    id: 'gallery',
    hosts: ['gallery.monalo.school', 'gallery.monalo.local', 'gallery.localhost'],
    basePath: '/gallery',
    rootOnSubdomain: true,
  },
  {
    id: 'shop',
    hosts: ['shop.monalo.school', 'shop.monalo.local', 'shop.localhost'],
    basePath: '/shop',
    rootOnSubdomain: true,
  },
  {
    id: 'learn',
    hosts: ['learn.monalo.school', 'learn.monalo.local', 'learn.localhost'],
    basePath: '/courses',
    rootOnSubdomain: true,
  },
  {
    id: 'blog',
    hosts: ['blog.monalo.school', 'blog.monalo.local', 'blog.localhost'],
    basePath: '/blog',
    rootOnSubdomain: true,
  },
  {
    id: 'team',
    hosts: ['team.monalo.school', 'team.monalo.local', 'team.localhost'],
    basePath: '/team',
    rootOnSubdomain: true,
  },
  {
    id: 'ecopenguin',
    hosts: ['ecopenguin.monalo.school', 'ecopenguin.monalo.local', 'ecopenguin.localhost'],
    basePath: '/learning',
    rootOnSubdomain: true,
  },
]

/** Paths that must not be rewritten on a surface subdomain */
const SUBDOMAIN_PASS_THROUGH = new Set([
  'api',
  '_next',
  'login',
  'register',
  'dashboard',
  'checkout',
  'see-off',
  'reset-password',
  'forgot-password',
  'classroom',
  'profile',
  'settings',
  'verify-email',
  'verify-request',
  'home',
  'about',
  'contact',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'uploads',
])

export function resolveSite(host: string, searchParams?: URLSearchParams): SiteConfig | null {
  const hostname = host.split(':')[0].toLowerCase()
  const fromHost = SITE_CONFIGS.find((s) => s.hosts.includes(hostname))
  if (fromHost) return fromHost

  // Local dev: localhost:3000?site=gallery
  const siteParam = searchParams?.get('site')
  if (siteParam) {
    return SITE_CONFIGS.find((s) => s.id === siteParam) ?? null
  }
  return null
}

function rewritePath(site: SiteConfig, pathname: string): string | null {
  if (!site.rootOnSubdomain) return null

  const first = pathname.split('/').filter(Boolean)[0]
  if (first && SUBDOMAIN_PASS_THROUGH.has(first)) return null

  if (pathname === '/' || pathname === '') {
    return site.basePath
  }

  if (pathname.startsWith(site.basePath)) {
    return null
  }

  return `${site.basePath}${pathname}`
}

/** Pathname the app will actually serve after subdomain rewriting (used for auth gating). */
export function resolveRoutedPathname(request: NextRequest): string {
  const pathname = request.nextUrl.pathname
  const site = resolveSite(request.headers.get('host') ?? '', request.nextUrl.searchParams)
  if (!site) return pathname
  return rewritePath(site, pathname) ?? pathname
}

const MAIN_HOSTS = new Set(['monalo.school', 'www.monalo.school'])
const ECOPENGUIN_HOST_SUFFIX = 'ecopenguin.monalo.school'

function isLearningPath(pathname: string): boolean {
  return pathname === '/learning' || pathname.startsWith('/learning/')
}

function stripLearningPrefix(pathname: string): string {
  return pathname.slice('/learning'.length) || '/'
}

/** Canonical Eco Penguin origin; redirects stay off until this is set (DNS must exist first). */
export function getEcoPenguinOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_ECOPENGUIN_URL?.trim()
  return raw ? raw.replace(/\/$/, '') : null
}

/**
 * Canonical URLs for Eco Penguin:
 * - monalo.school/learning/x       → ecopenguin.monalo.school/x
 * - ecopenguin.monalo.school/learning/x → ecopenguin.monalo.school/x
 */
export function ecoPenguinCanonicalRedirect(request: NextRequest): NextResponse | null {
  const origin = getEcoPenguinOrigin()
  if (!origin) return null
  if (request.method !== 'GET' && request.method !== 'HEAD') return null

  const { pathname, search } = request.nextUrl
  if (!isLearningPath(pathname)) return null

  const hostname = (request.headers.get('host') ?? '').split(':')[0].toLowerCase()
  if (MAIN_HOSTS.has(hostname)) {
    return NextResponse.redirect(`${origin}${stripLearningPrefix(pathname)}${search}`, 307)
  }
  if (hostname === ECOPENGUIN_HOST_SUFFIX) {
    // Build from the explicit origin: on Workers, request.nextUrl carries the app's configured
    // origin (monalo.school), not the host the visitor used.
    return NextResponse.redirect(`${origin}${stripLearningPrefix(pathname)}${search}`, 307)
  }
  return null
}

/**
 * Rewrite surface subdomains to app routes (gallery.monalo.school/slug → /gallery/slug).
 */
export function handleSiteRouting(request: NextRequest): NextResponse | null {
  const site = resolveSite(
    request.headers.get('host') ?? '',
    request.nextUrl.searchParams
  )
  if (!site) return null

  const rewritten = rewritePath(site, request.nextUrl.pathname)
  if (!rewritten) {
    const res = NextResponse.next()
    res.headers.set('x-monalo-site', site.id)
    return res
  }

  const url = request.nextUrl.clone()
  url.pathname = rewritten
  // On Workers, nextUrl's origin is the app's configured host, not the visitor's. A rewrite to a
  // different host is treated as an external fetch, which re-enters the middleware on the main
  // host. Pin the rewrite to the request's own Host so it stays an internal rewrite.
  const requestHost = request.headers.get('host')
  if (requestHost) url.host = requestHost
  const res = NextResponse.rewrite(url)
  res.headers.set('x-monalo-site', site.id)
  return res
}

export function getSitePublicUrl(site: MonaloSite): string {
  const envMap: Record<MonaloSite, string | undefined> = {
    gallery: process.env.NEXT_PUBLIC_GALLERY_URL,
    shop: process.env.NEXT_PUBLIC_SHOP_URL,
    learn: process.env.NEXT_PUBLIC_LEARN_URL,
    blog: process.env.NEXT_PUBLIC_BLOG_URL,
    team: process.env.NEXT_PUBLIC_TEAM_URL,
    ecopenguin: process.env.NEXT_PUBLIC_ECOPENGUIN_URL,
  }
  return envMap[site] || process.env.NEXT_PUBLIC_APP_URL || ''
}
