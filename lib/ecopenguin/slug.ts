/** "Fun Things" → "fun-things" (items.json key). */
export function categoryNameToSlug(name: string): string {
  return decodeURIComponent(name).trim().toLowerCase().replace(/\s+/g, '-')
}

/** "fun-things" → "Fun Things" */
export function categorySlugToDisplayName(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ')
}

/** "Zebra" → "zebra" */
export function itemNameToSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}
