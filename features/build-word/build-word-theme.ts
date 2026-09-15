export const buildWordTheme = {
  shell: 'min-h-screen bg-gradient-to-b from-sky-100 via-indigo-50 to-violet-50',
  header:
    'sticky top-0 z-20 border-b border-sky-200/70 bg-white/85 backdrop-blur-md shadow-sm',
  card: 'rounded-3xl border-2 border-white bg-white/95 shadow-lg shadow-sky-900/5',
  cardSoft: 'rounded-3xl border-2 border-sky-100 bg-white/90 shadow-md',
  btnPrimary:
    'rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-sky-600 hover:to-indigo-600 disabled:opacity-40',
  btnSecondary:
    'rounded-2xl border-2 border-sky-200 bg-white px-5 py-2.5 text-sm font-bold text-sky-950 transition hover:bg-sky-50 disabled:opacity-40',
  tile: 'inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-sky-200 bg-white text-2xl font-extrabold text-sky-950 shadow-sm transition active:scale-95 sm:h-16 sm:w-16',
  slot: 'inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/80 text-2xl font-extrabold text-indigo-900 sm:h-16 sm:w-16',
} as const
