import { NextRequest, NextResponse } from 'next/server'

export type MonaloSite = 'gallery' | 'shop' | 'learn' | 'blog' | 'team'

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
  }
  return envMap[site] || process.env.NEXT_PUBLIC_APP_URL || ''
}
