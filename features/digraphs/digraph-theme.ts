import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetCardSoft,
  planetHeader,
  planetShell,
} from '@/lib/learning/planet-theme'

/** Digraphs — Saturn / sun orange accent on dark sky. */
export const digraphTheme = {
  shell: planetShell,
  header: planetHeader,
  card: planetCard,
  cardSoft: planetCardSoft,
  pill: 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
  btnPrimary: planetBtn.saturn,
  btnSecondary: planetBtnSecondary,
} as const

export const DIGRAPH_ACCENT: Record<string, string> = {
  sh: 'from-amber-400 to-orange-500',
  ch: 'from-orange-400 to-rose-500',
  th: 'from-yellow-400 to-amber-500',
  wh: 'from-violet-400 to-orange-400',
}
