import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetHeader,
  planetShellFlex,
} from '@/lib/learning/planet-theme'

/** Balloon letters — sky / Earth blue accent on dark planet sky. */
export const balloonLettersTheme = {
  shell: `${planetShellFlex} h-dvh max-h-dvh overflow-hidden`,
  header: planetHeader,
  card: planetCard,
  btnPrimary: planetBtn.earth,
  btnSecondary: planetBtnSecondary,
  playfield:
    'relative min-h-[240px] w-full flex-1 overflow-hidden border-y border-[#fafaf9]/20 bg-[#0c0a09] bg-[radial-gradient(ellipse_at_50%_100%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(251,191,36,0.12),transparent_45%)] sm:rounded-3xl sm:border',
} as const

export const BALLOON_COLORS = [
  '#38bdf8',
  '#f472b6',
  '#fbbf24',
  '#34d399',
  '#a78bfa',
  '#fb7185',
  '#22d3ee',
  '#f97316',
] as const
