export const DIGRAPHS_LOCAL_MEDIA_PREFIX = '/digraphs'

export function resolveDigraphsAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${DIGRAPHS_LOCAL_MEDIA_PREFIX}${path}`
  return `${DIGRAPHS_LOCAL_MEDIA_PREFIX}/${path}`
}
