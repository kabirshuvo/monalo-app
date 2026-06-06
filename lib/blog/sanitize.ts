import { youtubeEmbedSrc, vimeoEmbedSrc } from '@/lib/blog/media'

const SAFE_IFRAME_SRC = /^https:\/\/(www\.youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)[a-zA-Z0-9_-]+/

/** Strip dangerous markup from blog HTML before rendering. */
export function sanitizeBlogHtml(html: string): string {
  let out = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')

  // Keep only safe iframes (YouTube / Vimeo embeds)
  out = out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (match) => {
    const srcMatch = match.match(/\ssrc\s*=\s*("([^"]*)"|'([^']*)')/i)
    const src = srcMatch?.[2] || srcMatch?.[3] || ''
    if (!SAFE_IFRAME_SRC.test(src)) return ''
    return `<iframe src="${src}" title="Embedded video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`
  })

  // Sanitize img tags — https only, strip event handlers already removed
  out = out.replace(/<img\b[^>]*>/gi, (match) => {
    const srcMatch = match.match(/\ssrc\s*=\s*("([^"]*)"|'([^']*)')/i)
    const src = srcMatch?.[2] || srcMatch?.[3] || ''
    if (!src || (!/^https:\/\//i.test(src) && !src.startsWith('/uploads/') && !src.startsWith('/api/media/'))) {
      return ''
    }
    const altMatch = match.match(/\salt\s*=\s*("([^"]*)"|'([^']*)')/i)
    const alt = altMatch?.[2] || altMatch?.[3] || ''
    return `<img src="${src}" alt="${alt.replace(/"/g, '&quot;')}" loading="lazy" />`
  })

  // Ensure external links open safely
  out = out.replace(/<a\b([^>]*)>/gi, (match, attrs: string) => {
    const hrefMatch = attrs.match(/\shref\s*=\s*("([^"]*)"|'([^']*)')/i)
    const href = hrefMatch?.[2] || hrefMatch?.[3] || ''
    if (!href || !/^https?:\/\//i.test(href)) return match
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">`
  })

  return out
}

/** Build a responsive video embed block for TipTap insertContent. */
export function videoEmbedHtml(provider: 'youtube' | 'vimeo', videoId: string): string {
  const src = provider === 'youtube' ? youtubeEmbedSrc(videoId) : vimeoEmbedSrc(videoId)
  return `<div data-video-embed="${provider}" class="blog-video-embed"><iframe src="${src}" title="Embedded video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`
}
