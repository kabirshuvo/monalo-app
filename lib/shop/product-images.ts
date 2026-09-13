/** Max images per craft-shop product: 1 hero + up to 4 gallery thumbs. */
export const MAX_PRODUCT_IMAGES = 5

export type ProductImageInput = {
  url: string
  order: number
  alt?: string | null
}

/**
 * Accept `images: [{ url, order?, alt? }]` or string URLs.
 * Returns up to MAX_PRODUCT_IMAGES entries with stable order 0..n-1.
 * Empty / invalid URLs are dropped.
 */
export function normalizeProductImages(input: unknown): ProductImageInput[] {
  if (!Array.isArray(input)) return []

  const parsed: ProductImageInput[] = []

  for (const item of input) {
    if (typeof item === 'string') {
      const url = item.trim()
      if (url) parsed.push({ url, order: parsed.length })
      continue
    }
    if (item && typeof item === 'object' && 'url' in item) {
      const url = String((item as { url?: unknown }).url ?? '').trim()
      if (!url) continue
      const altRaw = (item as { alt?: unknown }).alt
      const alt =
        typeof altRaw === 'string' && altRaw.trim() ? altRaw.trim().slice(0, 255) : null
      const orderRaw = (item as { order?: unknown }).order
      const order =
        typeof orderRaw === 'number' && Number.isInteger(orderRaw) ? orderRaw : parsed.length
      parsed.push({ url, order, alt })
    }
  }

  return parsed
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_PRODUCT_IMAGES)
    .map((img, index) => ({
      url: img.url,
      order: index,
      alt: img.alt ?? null,
    }))
}

/** Hero + gallery URLs for display; falls back to legacy `imageUrl`. */
export function resolveProductDisplayImages(product: {
  imageUrl: string | null
  images?: { url: string; alt: string | null; order: number }[]
}): { url: string; alt: string | null; order: number }[] {
  const fromRows = (product.images ?? [])
    .filter((img) => img.url.trim())
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_PRODUCT_IMAGES)

  if (fromRows.length > 0) {
    return fromRows.map((img, index) => ({
      url: img.url,
      alt: img.alt,
      order: index,
    }))
  }

  if (product.imageUrl?.trim()) {
    return [{ url: product.imageUrl.trim(), alt: null, order: 0 }]
  }

  return []
}
