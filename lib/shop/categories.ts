/**
 * MonAlo craft shop categories — single source of truth for UI, API validation, and Prisma enum.
 * Keep in sync with prisma/schema.prisma `ProductCategory`.
 */

export const SHOP_CATEGORIES = [
  {
    id: 'GYPSUM_POTTERY',
    slug: 'gypsum-pottery',
    label: 'Gypsum pottery',
    heading: 'Sculpted gypsum',
    subheading: 'Hand-formed planters, vessels & decorative pieces',
    description:
      'Studio-made gypsum pottery — smooth finishes, natural textures, and pieces shaped by MonAlo students and artisans.',
    emoji: '🏺',
    accent: 'amber',
  },
  {
    id: 'CANDLES',
    slug: 'candles',
    label: 'Artisan candles',
    heading: 'Decorative candles',
    subheading: 'Exceptional scents, colors & sculptural forms',
    description:
      'Poured and finished candles for calm evenings, gifts, and spaces that deserve a warm glow.',
    emoji: '🕯️',
    accent: 'rose',
  },
  {
    id: 'WOOD_CRAFT',
    slug: 'wood-craft',
    label: 'Wood crafts',
    heading: 'Wood & timber',
    subheading: 'Carved, turned & finished by hand',
    description:
      'Bowls, boards, and keepsakes from responsibly sourced wood — crafted in MonAlo workshops.',
    emoji: '🪵',
    accent: 'orange',
  },
  {
    id: 'BAMBOO_CRAFT',
    slug: 'bamboo-craft',
    label: 'Bamboo crafts',
    heading: 'Bamboo & weave',
    subheading: 'Light, strong & naturally beautiful',
    description:
      'Baskets, decor, and woven pieces that celebrate bamboo’s strength and gentle character.',
    emoji: '🎋',
    accent: 'green',
  },
  {
    id: 'BOOKS',
    slug: 'books',
    label: 'Books',
    heading: 'Books & readers',
    subheading: 'Stories, study guides & school publications',
    description:
      'Curated books, workbooks, and MonAlo publications — for learners, families, and anyone who loves a good read.',
    emoji: '📚',
    accent: 'sky',
  },
  {
    id: 'OTHER_CRAFT',
    slug: 'other-crafts',
    label: 'More crafts',
    heading: 'Studio favorites',
    subheading: 'Textiles, gifts & seasonal surprises',
    description:
      'Limited runs and mixed-media crafts that do not fit a single shelf — still made with care at MonAlo School.',
    emoji: '✨',
    accent: 'violet',
  },
] as const

export type ShopCategoryId = (typeof SHOP_CATEGORIES)[number]['id']
export type ShopCategorySlug = (typeof SHOP_CATEGORIES)[number]['slug']

export type ShopCategory = (typeof SHOP_CATEGORIES)[number]

const byId = new Map(SHOP_CATEGORIES.map((c) => [c.id, c]))
const bySlug = new Map(SHOP_CATEGORIES.map((c) => [c.slug, c]))

export function getShopCategory(id: ShopCategoryId): ShopCategory {
  return byId.get(id)!
}

export function getShopCategoryBySlug(slug: string): ShopCategory | undefined {
  return bySlug.get(slug as ShopCategorySlug)
}

export function parseShopCategorySlug(slug: string | undefined): ShopCategory | undefined {
  if (!slug) return undefined
  return getShopCategoryBySlug(slug)
}

export function isShopCategoryId(value: string): value is ShopCategoryId {
  return byId.has(value as ShopCategoryId)
}

export function shopCategoryLabel(id: ShopCategoryId): string {
  return getShopCategory(id).label
}

export const SHOP_CATEGORY_SELECT_OPTIONS = SHOP_CATEGORIES.map((c) => ({
  value: c.id,
  label: `${c.emoji} ${c.label} — ${c.subheading}`,
}))

export const CATEGORY_ACCENT_CLASSES: Record<
  ShopCategory['accent'],
  { chip: string; badge: string; card: string }
> = {
  amber: {
    chip: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100',
    badge: 'bg-amber-100 text-amber-800',
    card: 'from-amber-50 to-orange-50 border-amber-100',
  },
  rose: {
    chip: 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100',
    badge: 'bg-rose-100 text-rose-800',
    card: 'from-rose-50 to-pink-50 border-rose-100',
  },
  orange: {
    chip: 'border-orange-200 bg-orange-50 text-orange-900 hover:bg-orange-100',
    badge: 'bg-orange-100 text-orange-800',
    card: 'from-orange-50 to-amber-50 border-orange-100',
  },
  green: {
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100',
    badge: 'bg-emerald-100 text-emerald-800',
    card: 'from-emerald-50 to-green-50 border-emerald-100',
  },
  violet: {
    chip: 'border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100',
    badge: 'bg-violet-100 text-violet-800',
    card: 'from-violet-50 to-indigo-50 border-violet-100',
  },
  sky: {
    chip: 'border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100',
    badge: 'bg-sky-100 text-sky-800',
    card: 'from-sky-50 to-blue-50 border-sky-100',
  },
}
