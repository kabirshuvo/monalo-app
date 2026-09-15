/** Theme tokens for Vowel Words Practice (sibling to EcoPenguin, own palette). */
export const vowelTheme = {
  shell:
    'min-h-screen bg-gradient-to-b from-violet-100 via-fuchsia-50 to-amber-50 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.7),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(253,224,71,0.35),transparent_35%)]',
  header:
    'sticky top-0 z-20 border-b border-violet-200/70 bg-white/85 backdrop-blur-md shadow-sm shadow-violet-900/5',
  card: 'rounded-3xl border-2 border-white bg-white/95 shadow-lg shadow-violet-900/5',
  cardSoft: 'rounded-3xl border-2 border-violet-100 bg-white/90 shadow-md shadow-violet-900/5',
  pill: 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
  btnPrimary:
    'rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-900/15 transition hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-40',
  btnSecondary:
    'rounded-2xl border-2 border-violet-200 bg-white px-5 py-2.5 text-sm font-bold text-violet-950 transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-40',
  image: 'object-contain object-center p-1.5',
} as const

export const VOWEL_ACCENT: Record<string, string> = {
  a: 'from-rose-400 to-orange-400',
  e: 'from-emerald-400 to-teal-400',
  i: 'from-sky-400 to-indigo-400',
  o: 'from-amber-400 to-orange-500',
  u: 'from-violet-400 to-purple-500',
}
