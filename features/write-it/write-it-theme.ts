import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetHeader,
  planetShellFlex,
} from '@/lib/learning/planet-theme'

export const writeItTheme = {
  shell: planetShellFlex,
  header: planetHeader,
  card: planetCard,
  btnPrimary: planetBtn.mars,
  btnSecondary: planetBtnSecondary,
  tile: `${planetCard} min-h-14 min-w-[4.5rem] px-4 py-3 text-xl font-black text-[#fafaf9] transition active:scale-95`,
} as const
