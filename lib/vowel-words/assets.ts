import { VOWEL_WORDS_R2_PREFIX } from '@/lib/vowel-words/constants'
import { r2PublicBaseUrl } from '@/lib/storage/r2'

export const VOWEL_WORDS_LOCAL_MEDIA_PREFIX = '/vowel-words'

function withPrefix(base: string): string {
  const clean = base.replace(/\/$/, '')
  return VOWEL_WORDS_R2_PREFIX ? `${clean}/${VOWEL_WORDS_R2_PREFIX}` : clean
}

/**
 * Prefer explicit override, then local public/ folder.
 * Only use R2 when NEXT_PUBLIC_VOWEL_WORDS_USE_R2=1 so placeholders in public/ keep working.
 */
export function getVowelWordsMediaOrigin(): string {
  const override = process.env.NEXT_PUBLIC_VOWEL_WORDS_MEDIA_BASE_URL?.replace(/\/$/, '')
  if (override) return withPrefix(override)

  if (process.env.NEXT_PUBLIC_VOWEL_WORDS_USE_R2 === '1') {
    const publicBase = r2PublicBaseUrl()
    if (publicBase) return withPrefix(publicBase)
  }

  return VOWEL_WORDS_LOCAL_MEDIA_PREFIX
}

export function resolveVowelWordsAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = getVowelWordsMediaOrigin()
  if (path.startsWith('/')) return `${origin}${path}`
  return `${origin}/${path}`
}
