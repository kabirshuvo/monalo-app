/**
 * Eco Penguin planet palette — colors from the MonAlo landing hero planets
 * (`components/landing/LandingHeroMotion.tsx`).
 *
 * IMPORTANT: do not use Tailwind `white` / `bg-white` / `text-white` here.
 * In dark mode globals.css remaps `--color-white` to charcoal (#1c1917),
 * which makes white utilities invisible on the dark sky.
 */

export const planetColors = {
  sky: '#0c0a09',
  text: '#fafaf9',
  textMuted: '#d6d3d1',
  textDim: '#a8a29e',
  surface: '#1c1917',
  surfaceRaised: '#292524',
  sun: '#fbbf24',
  sunMid: '#f59e0b',
  sunDeep: '#ea580c',
  earthLight: '#bae6fd',
  earth: '#38bdf8',
  earthDeep: '#1d4ed8',
  marsLight: '#fecaca',
  mars: '#f87171',
  marsDeep: '#b91c1c',
  saturn: '#fdba74',
  saturnDeep: '#c2410c',
  saturnRing: '#c4b5fd',
  jupiterLight: '#fef3c7',
  jupiter: '#fcd34d',
  jupiterDeep: '#d97706',
  cyan: '#22d3ee',
  emerald: '#34d399',
  violet: '#a78bfa',
} as const

/** Shared dark-sky shell with soft sun + Earth glow (no pastel gradients). */
export const planetShell =
  'min-h-screen bg-[#0c0a09] bg-[radial-gradient(ellipse_at_75%_20%,rgba(251,191,36,0.14),transparent_50%),radial-gradient(ellipse_at_15%_80%,rgba(56,189,248,0.12),transparent_45%)] text-[#fafaf9]'

export const planetShellFlex =
  'flex min-h-screen flex-col bg-[#0c0a09] bg-[radial-gradient(ellipse_at_75%_20%,rgba(251,191,36,0.14),transparent_50%),radial-gradient(ellipse_at_15%_80%,rgba(56,189,248,0.12),transparent_45%)] text-[#fafaf9]'

export const planetHeader =
  'sticky top-0 z-20 border-b border-[#fafaf9]/15 bg-[#0c0a09]/95 backdrop-blur-md shadow-sm shadow-black/40'

/** Raised cards — solid stone so tiles stay visible in site dark mode. */
export const planetCard =
  'rounded-3xl border border-[#fafaf9]/20 bg-[#1c1917] shadow-lg shadow-black/40'

export const planetCardSoft =
  'rounded-3xl border border-[#fafaf9]/15 bg-[#292524] shadow-md shadow-black/30'

export const planetBtnSecondary =
  'rounded-2xl border border-[#fafaf9]/25 bg-[#292524] px-5 py-2.5 text-sm font-bold text-[#fafaf9] transition hover:bg-[#44403c] disabled:opacity-40'

export const planetText = 'text-[#fafaf9]'
export const planetTextMuted = 'text-[#d6d3d1]'
export const planetTextDim = 'text-[#a8a29e]'

export const planetFooter =
  'mt-8 border-t border-[#fafaf9]/15 bg-black/70 text-[#fafaf9]'

/** Room primary button gradients (planet accents). Always use hex text, never text-white. */
export const planetBtn = {
  earth:
    'rounded-2xl bg-gradient-to-r from-sky-400 to-blue-700 px-5 py-2.5 text-sm font-bold text-[#fafaf9] shadow-md shadow-sky-900/40 transition hover:from-sky-300 hover:to-blue-600 disabled:opacity-40',
  cyan:
    'rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-600 px-5 py-2.5 text-sm font-bold text-[#0c0a09] shadow-md shadow-cyan-900/40 transition hover:from-cyan-300 hover:to-cyan-500 disabled:opacity-40',
  emerald:
    'rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-600 px-5 py-2.5 text-sm font-bold text-[#0c0a09] shadow-md shadow-emerald-900/40 transition hover:from-emerald-300 hover:to-teal-500 disabled:opacity-40',
  jupiter:
    'rounded-2xl bg-gradient-to-r from-amber-200 to-amber-600 px-5 py-2.5 text-sm font-bold text-[#0c0a09] shadow-md shadow-amber-900/40 transition hover:from-amber-100 hover:to-amber-500 disabled:opacity-40',
  saturn:
    'rounded-2xl bg-gradient-to-r from-orange-400 to-orange-700 px-5 py-2.5 text-sm font-bold text-[#fafaf9] shadow-md shadow-orange-900/40 transition hover:from-orange-300 hover:to-orange-600 disabled:opacity-40',
  mars:
    'rounded-2xl bg-gradient-to-r from-rose-400 to-red-700 px-5 py-2.5 text-sm font-bold text-[#fafaf9] shadow-md shadow-red-900/40 transition hover:from-rose-300 hover:to-red-600 disabled:opacity-40',
  sun:
    'rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 px-5 py-2.5 text-sm font-bold text-[#0c0a09] shadow-md shadow-amber-900/40 transition hover:from-amber-200 hover:to-orange-400 disabled:opacity-40',
} as const
