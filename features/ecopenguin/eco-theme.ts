/** Eco Penguin artwork is 800×685 — use this aspect so images are not cropped. */
export const ECO_PENGUIN_IMAGE_ASPECT = 'aspect-[800/685]' as const

export const ecoTheme = {
  shell:
    'min-h-screen bg-gradient-to-b from-sky-200 via-cyan-50 to-emerald-100 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.55),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(186,230,253,0.45),transparent_35%)]',
  header:
    'sticky top-0 z-20 border-b border-sky-200/70 bg-white/85 backdrop-blur-md shadow-sm shadow-sky-900/5',
  card: 'rounded-3xl border-2 border-white bg-white/95 shadow-lg shadow-teal-900/5',
  cardSoft: 'rounded-3xl border-2 border-sky-100 bg-white/90 shadow-md shadow-sky-900/5',
  pill: 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
  btnPrimary:
    'rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-900/15 transition hover:from-teal-600 hover:to-emerald-600 disabled:opacity-40',
  btnSecondary:
    'rounded-2xl border-2 border-sky-200 bg-white px-5 py-2.5 text-sm font-bold text-sky-900 transition hover:border-sky-300 hover:bg-sky-50 disabled:opacity-40',
  btnIcon:
    'inline-flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-lg transition hover:scale-105 hover:bg-emerald-100 active:scale-95',
  /** Show full illustration without cropping sides. */
  image: 'object-contain object-center p-1.5',
} as const
