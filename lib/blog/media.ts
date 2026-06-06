const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'media.monalo.school',
  'monalo.school',
]

export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
    if (parsed.protocol === 'http:' && parsed.hostname !== 'localhost') return false
    if (parsed.hostname === 'localhost' || parsed.hostname.endsWith('.localhost')) return true
    if (ALLOWED_IMAGE_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
      return true
    }
    // R2 / app media URLs
    if (parsed.pathname.startsWith('/api/media/') || parsed.pathname.startsWith('/uploads/')) {
      return true
    }
    const r2Base = process.env.R2_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_ECO_PENGUIN_MEDIA_BASE_URL
    if (r2Base) {
      const { hostname } = new URL(r2Base)
      if (parsed.hostname === hostname) return true
    }
    return false
  } catch {
    return false
  }
}

export function parseYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0]
      return id || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v')
      const embed = parsed.pathname.match(/^\/embed\/([^/?]+)/)
      if (embed) return embed[1]
      const shorts = parsed.pathname.match(/^\/shorts\/([^/?]+)/)
      if (shorts) return shorts[1]
    }
    return null
  } catch {
    return null
  }
}

export function parseVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'vimeo.com') {
      const id = parsed.pathname.match(/^\/(\d+)/)
      return id?.[1] ?? null
    }
    if (host === 'player.vimeo.com') {
      const id = parsed.pathname.match(/^\/video\/(\d+)/)
      return id?.[1] ?? null
    }
    return null
  } catch {
    return null
  }
}

export function youtubeEmbedSrc(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}

export function vimeoEmbedSrc(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`
}

export type VideoEmbed = { provider: 'youtube' | 'vimeo'; embedSrc: string; videoId: string }

export function parseVideoEmbed(url: string): VideoEmbed | null {
  const yt = parseYoutubeId(url)
  if (yt) return { provider: 'youtube', videoId: yt, embedSrc: youtubeEmbedSrc(yt) }
  const vimeo = parseVimeoId(url)
  if (vimeo) return { provider: 'vimeo', videoId: vimeo, embedSrc: vimeoEmbedSrc(vimeo) }
  return null
}
