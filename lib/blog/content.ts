import { sanitizeBlogHtml } from '@/lib/blog/sanitize'

export function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content.trim())
}

export function plainTextFromContent(content: string): string {
  if (!isHtmlContent(content)) return content
  return content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function readingTimeMinutes(content: string): number {
  const words = plainTextFromContent(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function excerptFromContent(content: string, max = 160): string {
  const text = plainTextFromContent(content)
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trim()}…`
}

export function sanitizeBlogContentForRender(content: string): string {
  if (!isHtmlContent(content)) {
    return content
      .split('\n\n')
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join('')
  }
  return sanitizeBlogHtml(content)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
