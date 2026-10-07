/**
 * The MonAlo solar system — one source of truth for how the site maps onto the sky.
 *
 * The school is the sun. Each planet is a part of the site, ordered outward from the sun.
 * Colours here drive the landing orrery, page heroes, nav dots and footer.
 */

export type PlanetId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'

export type Planet = {
  id: PlanetId
  /** Astronomical name, shown small */
  name: string
  /** What this body is on the site */
  section: string
  href: string
  /** One plain sentence about what you'll find there */
  blurb: string
  colors: { light: string; base: string; dark: string }
  /** Extra surface detail layered over the sphere */
  texture?: string
  ring?: boolean
  /** Orrery geometry (landing). Radius is a fraction of the system's half-width. */
  orbit?: {
    radius: number
    /** Planet diameter in container-width units (cqw) */
    size: number
    /** Seconds per revolution — farther is slower */
    period: number
    /** Starting position, 0–1 of a full turn */
    phase: number
  }
}

export const SUN: Planet = {
  id: 'sun',
  name: 'Sun',
  section: 'Monalo School',
  href: '/home',
  blurb:
    'The centre of everything. What the school is, who it serves, and how each part keeps students learning.',
  colors: { light: '#fffbea', base: '#ffb547', dark: '#f08a24' },
}

export const PLANETS: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    section: 'About',
    href: '/about',
    blurb: 'Closest to the sun: who we are, and why MonAlo moves at a calm pace.',
    colors: { light: '#ece7df', base: '#a9a39b', dark: '#55504a' },
    texture:
      'radial-gradient(circle at 62% 58%, rgba(60,55,50,0.35) 0 9%, transparent 10%), radial-gradient(circle at 38% 70%, rgba(60,55,50,0.28) 0 6%, transparent 7%)',
    orbit: { radius: 0.27, size: 2.6, period: 26, phase: 0.12 },
  },
  {
    id: 'venus',
    name: 'Venus',
    section: 'Gallery',
    href: '/gallery',
    blurb: 'Original paintings from the Monalo studio. Each sale keeps art classes running.',
    colors: { light: '#fff6cc', base: '#f0d26a', dark: '#a07a14' },
    texture:
      'repeating-linear-gradient(160deg, transparent 0 14%, rgba(176,116,40,0.22) 14% 20%)',
    orbit: { radius: 0.37, size: 3.6, period: 40, phase: 0.58 },
  },
  {
    id: 'earth',
    name: 'Earth',
    section: 'Courses',
    href: '/courses',
    blurb: 'Structured lessons you take at your own pace, with progress saved as you go.',
    colors: { light: '#d4f1ff', base: '#3ea6e8', dark: '#1a3f9e' },
    texture:
      'radial-gradient(ellipse 30% 22% at 38% 40%, rgba(70,160,80,0.85) 0 60%, transparent 62%), radial-gradient(ellipse 22% 28% at 64% 66%, rgba(70,160,80,0.75) 0 60%, transparent 62%)',
    orbit: { radius: 0.48, size: 3.9, period: 56, phase: 0.33 },
  },
  {
    id: 'mars',
    name: 'Mars',
    section: 'Craft shop',
    href: '/shop',
    blurb: 'Gypsum pottery, candles, wood and bamboo, made by hand. Sales fund the school.',
    colors: { light: '#ffd5c0', base: '#e2643a', dark: '#8e2a14' },
    texture:
      'radial-gradient(ellipse 40% 18% at 50% 12%, rgba(255,240,230,0.55) 0 50%, transparent 55%)',
    orbit: { radius: 0.58, size: 3.1, period: 74, phase: 0.81 },
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    section: 'Team',
    href: '/team',
    blurb: 'The giant: hire Monalo freelancers for software, design and video. Fees return to the school.',
    colors: { light: '#f6cba6', base: '#d0885a', dark: '#74391a' },
    texture:
      'repeating-linear-gradient(172deg, transparent 0 11%, rgba(127,69,32,0.38) 11% 17%, transparent 17% 24%), radial-gradient(ellipse 16% 10% at 64% 64%, rgba(170,60,30,0.75) 0 60%, transparent 62%)',
    orbit: { radius: 0.7, size: 7, period: 112, phase: 0.05 },
  },
  {
    id: 'saturn',
    name: 'Saturn',
    section: 'Blog',
    href: '/blog',
    blurb: 'Stories in circulation: practical guides for guardians and kids on homework, sleep and screens.',
    colors: { light: '#f5ecd2', base: '#d4c093', dark: '#7d6634' },
    texture: 'repeating-linear-gradient(176deg, transparent 0 16%, rgba(156,117,49,0.25) 16% 22%)',
    ring: true,
    orbit: { radius: 0.81, size: 5.2, period: 150, phase: 0.47 },
  },
  {
    id: 'uranus',
    name: 'Uranus',
    section: 'Contact',
    href: '/contact',
    blurb: 'Questions, ideas or a bug to report. We usually reply within a day.',
    colors: { light: '#e3fffc', base: '#7fd9d2', dark: '#2a8790' },
    orbit: { radius: 0.9, size: 4.2, period: 196, phase: 0.7 },
  },
  {
    id: 'neptune',
    name: 'Neptune',
    section: 'Start today',
    href: '/register',
    blurb: 'The far edge, and the start: create a free account to save progress and earn points.',
    colors: { light: '#dae4ff', base: '#4a6cf0', dark: '#1b2a8c' },
    texture:
      'radial-gradient(ellipse 18% 12% at 60% 40%, rgba(20,30,110,0.55) 0 60%, transparent 62%)',
    orbit: { radius: 0.985, size: 4, period: 248, phase: 0.24 },
  },
]

/** Earth's companion. Small, close, quick — like its young readers. */
export const MOON: Planet = {
  id: 'moon',
  name: 'Moon',
  section: 'Eco Penguin',
  href: '/learning',
  blurb: 'Phonics games for young readers: letter sounds, vowels, digraphs and stories.',
  colors: { light: '#fbf8f0', base: '#cfcbc2', dark: '#77726a' },
  texture:
    'radial-gradient(circle at 60% 40%, rgba(90,85,78,0.35) 0 12%, transparent 13%), radial-gradient(circle at 36% 66%, rgba(90,85,78,0.3) 0 9%, transparent 10%)',
  orbit: { radius: 0, size: 1.8, period: 11, phase: 0.2 },
}

export const ALL_BODIES: Planet[] = [SUN, ...PLANETS.slice(0, 3), MOON, ...PLANETS.slice(3)]

const BY_ID = Object.fromEntries(ALL_BODIES.map((p) => [p.id, p])) as Record<PlanetId, Planet>

export function getPlanet(id: PlanetId): Planet {
  return BY_ID[id]
}

/** Which body a route belongs to — used to colour nav items and page heroes. */
export function planetForPath(path: string): Planet | null {
  if (!path) return null
  const match = ALL_BODIES.filter((p) => path === p.href || path.startsWith(`${p.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0]
  return match ?? null
}

/** CSS custom properties for a planet orb. */
export function planetStyle(p: Planet, size?: number): Record<string, string> {
  const style: Record<string, string> = {
    '--p-light': p.colors.light,
    '--p-base': p.colors.base,
    '--p-dark': p.colors.dark,
  }
  if (p.texture) style['--p-texture'] = p.texture
  if (size !== undefined) style['--s'] = `${size}px`
  return style
}
