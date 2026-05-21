import type { MonaloSite } from '@/lib/sites'
import { getSitePublicUrl } from '@/lib/sites'

/** Server-safe gallery path */
export function galleryPath(slug?: string): string {
  return slug ? `/gallery/${slug}` : '/gallery'
}

/**
 * Client: use root paths on gallery.monalo.school, /gallery on main host.
 */
export function galleryHref(slug?: string): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase()
    if (host.startsWith('gallery.')) {
      return slug ? `/${slug}` : '/'
    }
  }
  return galleryPath(slug)
}

export function absoluteSiteUrl(site: MonaloSite, path = ''): string {
  const base = getSitePublicUrl(site)
  if (!base) return path
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}
