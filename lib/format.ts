export function formatPriceCents(cents: number | bigint | null | undefined, currency = 'USD'): string {
  const amount = cents == null ? 0 : Number(cents)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
