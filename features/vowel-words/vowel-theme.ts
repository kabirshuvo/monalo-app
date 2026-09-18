import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetCardSoft,
  planetHeader,
  planetShell,
} from '@/lib/learning/planet-theme'

/** Vowel Words — Jupiter gold accent on dark sky. */
export const vowelTheme = {
  shell: planetShell,
  header: planetHeader,
  card: planetCard,
  cardSoft: planetCardSoft,
  pill: 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
  btnPrimary: planetBtn.jupiter,
  btnSecondary: planetBtnSecondary,
  image: 'object-contain object-center p-1.5',
} as const

export const VOWEL_ACCENT: Record<string, string> = {
  a: 'from-rose-400 to-orange-400',
  e: 'from-emerald-400 to-teal-400',
  i: 'from-sky-400 to-blue-600',
  o: 'from-amber-400 to-orange-500',
  u: 'from-violet-400 to-purple-500',
}
