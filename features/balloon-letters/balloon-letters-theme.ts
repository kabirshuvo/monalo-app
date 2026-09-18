import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetHeader,
  planetShellFlex,
} from '@/lib/learning/planet-theme'

/** Balloon letters — sky / Earth blue accent on dark planet sky. */
export const balloonLettersTheme = {
  shell: planetShellFlex,
  header: planetHeader,
  card: planetCard,
  btnPrimary: planetBtn.earth,
  btnSecondary: planetBtnSecondary,
  playfield:
    'relative h-[min(70vh,520px)] w-full overflow-hidden rounded-3xl border border-[#fafaf9]/20 bg-[#0c0a09] bg-[radial-gradient(ellipse_at_50%_100%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(251,191,36,0.12),transparent_45%)]',
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
