import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetCardSoft,
  planetHeader,
  planetShellFlex,
} from '@/lib/learning/planet-theme'

/** Build the word — Mars red accent on dark sky. */
export const buildWordTheme = {
  shell: `${planetShellFlex}`,
  header: planetHeader,
  card: planetCard,
  cardSoft: planetCardSoft,
  btnPrimary: planetBtn.mars,
  btnSecondary: planetBtnSecondary,
  tile:
    'inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#fafaf9]/25 bg-[#292524] text-2xl font-extrabold text-[#fafaf9] shadow-sm transition active:scale-95 sm:h-16 sm:w-16',
  slot:
    'inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-rose-400/50 bg-rose-950/40 text-2xl font-extrabold text-rose-100 sm:h-16 sm:w-16',
} as const
