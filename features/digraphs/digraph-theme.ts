/** Amber/orange kids theme for Digraphs. */
export const digraphTheme = {
  shell:
    'min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-50',
  header:
    'sticky top-0 z-20 border-b border-amber-200/70 bg-white/85 backdrop-blur-md shadow-sm',
  card: 'rounded-3xl border-2 border-white bg-white/95 shadow-lg shadow-amber-900/5',
  cardSoft: 'rounded-3xl border-2 border-amber-100 bg-white/90 shadow-md',
  pill: 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
  btnPrimary:
    'rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-orange-600 disabled:opacity-40',
  btnSecondary:
    'rounded-2xl border-2 border-amber-200 bg-white px-5 py-2.5 text-sm font-bold text-amber-950 transition hover:bg-amber-50 disabled:opacity-40',
} as const

export const DIGRAPH_ACCENT: Record<string, string> = {
  sh: 'from-amber-400 to-orange-500',
  ch: 'from-orange-400 to-rose-500',
  th: 'from-yellow-400 to-amber-500',
  wh: 'from-amber-500 to-red-400',
}

