import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetCardSoft,
  planetHeader,
  planetShell,
} from '@/lib/learning/planet-theme'

/** Eco Penguin artwork is 800×685 — use this aspect so images are not cropped. */
export const ECO_PENGUIN_IMAGE_ASPECT = 'aspect-[800/685]' as const

/** Explore — emerald star accent on dark sky. */
export const ecoTheme = {
  shell: planetShell,
  header: planetHeader,
  card: planetCard,
  cardSoft: planetCardSoft,
  pill: 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
  btnPrimary: planetBtn.emerald,
  btnSecondary: planetBtnSecondary,
  btnIcon:
    'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#fafaf9]/25 bg-[#292524] text-lg text-[#fafaf9] transition hover:scale-105 hover:bg-[#44403c] active:scale-95',
  /** Show full illustration without cropping sides. */
  image: 'object-contain object-center p-1.5',
} as const
