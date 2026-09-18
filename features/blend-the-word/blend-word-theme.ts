import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetHeader,
  planetShellFlex,
} from '@/lib/learning/planet-theme'

/** Blend the word — cyan star accent on dark sky. */
export const blendWordTheme = {
  shell: planetShellFlex,
  header: planetHeader,
  card: planetCard,
  btnPrimary: planetBtn.cyan,
  btnSecondary: planetBtnSecondary,
} as const
