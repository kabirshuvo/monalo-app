import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetHeader,
  planetShellFlex,
} from '@/lib/learning/planet-theme'

/** Letter sounds — Earth blue accent on dark sky. */
export const letterSoundsTheme = {
  shell: planetShellFlex,
  header: planetHeader,
  card: planetCard,
  btnPrimary: planetBtn.earth,
  btnSecondary: planetBtnSecondary,
} as const
