import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetHeader,
  planetShellFlex,
} from '@/lib/learning/planet-theme'

export const sightWordsTheme = {
  shell: planetShellFlex,
  header: planetHeader,
  card: planetCard,
  btnPrimary: planetBtn.jupiter,
  btnSecondary: planetBtnSecondary,
} as const
