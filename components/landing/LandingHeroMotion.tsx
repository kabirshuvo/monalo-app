'use client'

import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  homeX: number
  homeY: number
  size: number
  color: string
  glow: string
  phase: number
  breathMs: number
  driftAmp: number
  spinDeg: number
  twinkleMs: number
  wobbleMs: number
  el: SVGSVGElement | null
}

type PlanetBody = {
  kind: 'planet'
  name: string
  /** Orbit radius around the sun (px) */
  orbitR: number
  /** Orbital period (ms) — farther ≈ slower */
  periodMs: number
  /** Starting angle (rad) */
  angle0: number
  /** Slight orbit flatten for ellipse feel */
  ecc: number
  /** Axial spin period (ms) */
  spinMs: number
  size: number
  fill: string
  glow: string
  ring: boolean
  /** Mark which planet the moon orbits */
  isEarth?: boolean
  el: HTMLElement | null
  spinEl: HTMLElement | null
  x: number
  y: number
}

type MoonBody = {
  kind: 'moon'
  name: string
  /** Orbit radius around Earth (px) */
  orbitR: number
  periodMs: number
  angle0: number
  size: number
  el: HTMLElement | null
  /** Update illuminated shape from phase angle (0 = new, π = full) */
  setPhase: ((phaseAngle: number) => void) | null
  x: number
  y: number
}

const PALETTE = [
  { color: '#38bdf8', glow: 'rgba(56,189,248,0.45)' },
  { color: '#f472b6', glow: 'rgba(244,114,182,0.45)' },
  { color: '#fbbf24', glow: 'rgba(251,191,36,0.5)' },
  { color: '#34d399', glow: 'rgba(52,211,153,0.4)' },
  { color: '#a78bfa', glow: 'rgba(167,139,250,0.45)' },
  { color: '#fb7185', glow: 'rgba(251,113,133,0.4)' },
  { color: '#22d3ee', glow: 'rgba(34,211,238,0.4)' },
  { color: '#f97316', glow: 'rgba(249,115,22,0.4)' },
  { color: '#78716c', glow: 'rgba(120,113,108,0.35)' },
]

function mulberry32(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function createStarSvg(size: number, color: string, glow: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('aria-hidden', 'true')
  svg.classList.add('absolute', 'left-0', 'top-0')
  svg.style.filter = `drop-shadow(0 0 ${Math.max(5, size * 0.55)}px ${glow})`
  svg.style.willChange = 'transform, opacity'
  svg.style.pointerEvents = 'none'

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute(
    'd',
    'M12 2 L13.2 9.2 L20.5 10.5 L13.2 11.8 L12 19 L10.8 11.8 L3.5 10.5 L10.8 9.2 Z',
  )
  path.setAttribute('fill', color)
  svg.appendChild(path)
  return svg
}

function createTooltipEl(): HTMLElement {
  const tip = document.createElement('div')
  tip.className = 'absolute left-0 top-0 z-20'
  tip.style.pointerEvents = 'none'
  tip.style.opacity = '0'
  tip.style.transition = 'opacity 0.25s ease'
  tip.style.padding = '0.35rem 0.7rem'
  tip.style.borderRadius = '9999px'
  tip.style.background = 'rgba(28, 25, 23, 0.88)'
  tip.style.color = '#fafaf9'
  tip.style.fontSize = '0.75rem'
  tip.style.fontWeight = '600'
  tip.style.letterSpacing = '0.04em'
  tip.style.whiteSpace = 'nowrap'
  tip.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
  tip.style.willChange = 'transform, opacity'
  tip.setAttribute('aria-hidden', 'true')
  return tip
}

function enableCelestialHover(
  el: HTMLElement,
  name: string,
  tooltip: HTMLElement,
  getCenter: () => { x: number; y: number; size: number },
  onHoverChange: (name: string | null) => void,
) {
  el.style.pointerEvents = 'auto'
  el.style.cursor = 'help'
  el.setAttribute('role', 'img')
  el.setAttribute('aria-label', name)
  el.tabIndex = 0
  // Larger hit target for small bodies
  el.style.padding = '10px'
  el.style.margin = '-10px'
  el.style.boxSizing = 'content-box'

  const show = () => {
    const { x, y, size } = getCenter()
    tooltip.textContent = name
    tooltip.style.opacity = '1'
    tooltip.style.transform = `translate3d(${x}px, ${y - size / 2 - 28}px, 0) translateX(-50%)`
    onHoverChange(name)
  }
  const hide = () => {
    tooltip.style.opacity = '0'
    onHoverChange(null)
  }

  el.addEventListener('pointerenter', show)
  el.addEventListener('pointermove', show)
  el.addEventListener('pointerleave', hide)
  el.addEventListener('focus', show)
  el.addEventListener('blur', hide)
}

/**
 * Phaseable moon: disc + moving shadow terminator.
 * phaseAngle 0 ≈ new, π ≈ full (sun-earth-moon geometry).
 */
function createMoonEl(size: number): {
  wrap: HTMLElement
  setPhase: (phaseAngle: number) => void
} {
  const wrap = document.createElement('div')
  wrap.className = 'absolute left-0 top-0'
  wrap.style.width = `${size}px`
  wrap.style.height = `${size}px`
  wrap.style.pointerEvents = 'auto'
  wrap.style.willChange = 'transform, opacity, filter'
  wrap.style.zIndex = '3'

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 64 64')
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('aria-hidden', 'true')

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
  clip.setAttribute('id', 'landing-moon-clip')
  const clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  clipCircle.setAttribute('cx', '32')
  clipCircle.setAttribute('cy', '32')
  clipCircle.setAttribute('r', '22')
  clip.appendChild(clipCircle)
  defs.appendChild(clip)
  svg.appendChild(defs)

  // Unlit body (always there as faint silhouette)
  const dark = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  dark.setAttribute('cx', '32')
  dark.setAttribute('cy', '32')
  dark.setAttribute('r', '22')
  dark.setAttribute('fill', '#44403c')
  dark.setAttribute('opacity', '0.55')
  svg.appendChild(dark)

  // Lit surface clipped to moon disc; shadow circle carves phases
  const litGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  litGroup.setAttribute('clip-path', 'url(#landing-moon-clip)')

  const lit = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  lit.setAttribute('cx', '32')
  lit.setAttribute('cy', '32')
  lit.setAttribute('r', '22')
  lit.setAttribute('fill', '#fafaf9')
  litGroup.appendChild(lit)

  // Opaque shadow disc that slides across to form crescent → quarter → gibbous → full
  const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  shadow.setAttribute('cy', '32')
  shadow.setAttribute('r', '22')
  shadow.setAttribute('fill', '#44403c')
  litGroup.appendChild(shadow)

  svg.appendChild(litGroup)

  const rim = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  rim.setAttribute('cx', '32')
  rim.setAttribute('cy', '32')
  rim.setAttribute('r', '22')
  rim.setAttribute('fill', 'none')
  rim.setAttribute('stroke', 'rgba(186,230,253,0.3)')
  rim.setAttribute('stroke-width', '1.25')
  svg.appendChild(rim)

  wrap.appendChild(svg)

  const setPhase = (phaseAngle: number) => {
    // 0 → new, π → full, based on Sun–Earth–Moon angle
    const cos = Math.cos(phaseAngle)
    const sin = Math.sin(phaseAngle)
    const amount = 22 * (1 - cos) // 0 at new … 44 at full
    const dir = sin >= 0 ? 1 : -1
    shadow.setAttribute('cx', String(32 + dir * amount))

    // Softer when near new, brighter glow near full
    const illum = (1 - cos) / 2
    wrap.style.filter = `drop-shadow(0 0 ${6 + illum * 18}px rgba(250,250,249,${0.12 + illum * 0.5}))`
  }

  setPhase(Math.PI) // start near full so it's visible immediately
  return { wrap, setPhase }
}

function createPlanetEl(
  size: number,
  fill: string,
  glow: string,
  ring: boolean,
): { wrap: HTMLElement; spinEl: HTMLElement } {
  const wrap = document.createElement('div')
  wrap.className = 'absolute left-0 top-0'
  wrap.style.width = `${size}px`
  wrap.style.height = `${size}px`
  wrap.style.pointerEvents = 'auto'
  wrap.style.willChange = 'transform, opacity'
  wrap.style.filter = `drop-shadow(0 0 ${size * 0.35}px ${glow})`
  wrap.style.zIndex = '2'

  const spinEl = document.createElement('div')
  spinEl.style.width = '100%'
  spinEl.style.height = '100%'
  spinEl.style.position = 'relative'
  spinEl.style.willChange = 'transform'

  const body = document.createElement('div')
  body.style.width = '100%'
  body.style.height = '100%'
  body.style.borderRadius = '9999px'
  body.style.background = fill
  body.style.boxShadow =
    'inset -6px -8px 14px rgba(0,0,0,0.18), inset 4px 5px 10px rgba(255,255,255,0.25)'
  spinEl.appendChild(body)

  if (ring) {
    const ringEl = document.createElement('div')
    ringEl.style.position = 'absolute'
    ringEl.style.left = '50%'
    ringEl.style.top = '50%'
    ringEl.style.width = `${size * 1.65}px`
    ringEl.style.height = `${size * 0.42}px`
    ringEl.style.marginLeft = `${(-size * 1.65) / 2}px`
    ringEl.style.marginTop = `${(-size * 0.42) / 2}px`
    ringEl.style.borderRadius = '9999px'
    ringEl.style.border = '2px solid rgba(233,213,255,0.55)'
    ringEl.style.boxShadow = '0 0 8px rgba(196,181,253,0.35)'
    ringEl.style.transform = 'rotate(-18deg)'
    spinEl.appendChild(ringEl)
  }

  wrap.appendChild(spinEl)
  return { wrap, spinEl }
}

function createSunEl(size: number): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'absolute left-0 top-0'
  wrap.style.width = `${size}px`
  wrap.style.height = `${size}px`
  wrap.style.borderRadius = '9999px'
  wrap.style.pointerEvents = 'auto'
  wrap.style.zIndex = '1'
  wrap.style.background =
    'radial-gradient(circle at 40% 35%, #fff7ed 0%, #fde68a 28%, #f59e0b 62%, #ea580c 100%)'
  wrap.style.boxShadow =
    '0 0 40px rgba(251,191,36,0.55), 0 0 80px rgba(245,158,11,0.28), inset -4px -6px 12px rgba(0,0,0,0.12)'
  wrap.style.willChange = 'transform, opacity'
  return wrap
}

function spawnStars(w: number, h: number, seed = 42): Star[] {
  const rand = mulberry32(seed)
  const count = 16 + Math.floor(rand() * 8)
  const stars: Star[] = []

  for (let i = 0; i < count; i++) {
    const palette = PALETTE[Math.floor(rand() * PALETTE.length)]!
    const size = 9 + Math.floor(rand() * 12)
    const x = w * (0.42 + rand() * 0.52) - size / 2
    const y = rand() * Math.max(h - size, 1)

    stars.push({
      homeX: x,
      homeY: y,
      x,
      y,
      size,
      color: palette.color,
      glow: palette.glow,
      phase: rand() * Math.PI * 2,
      breathMs: 5200 + rand() * 4800,
      driftAmp: 8 + rand() * 16,
      spinDeg: (rand() < 0.5 ? -1 : 1) * (5 + rand() * 14),
      twinkleMs: 3000 + rand() * 4000,
      wobbleMs: 4000 + rand() * 5000,
      el: null,
    })
  }
  return stars
}

function spawnSystem(w: number, h: number): {
  sun: { x: number; y: number; size: number; el: HTMLElement | null }
  planets: PlanetBody[]
  moon: MoonBody
} {
  const sunSize = Math.min(56, Math.max(40, w * 0.045))
  const sunX = w * 0.72
  const sunY = h * 0.48

  // Radii scale with viewport; periods ~ r^1.5 (Kepler feel), sped up for visibility
  const scale = Math.min(w, h)
  const planets: PlanetBody[] = [
    {
      kind: 'planet',
      name: 'Mercury',
      orbitR: scale * 0.1,
      periodMs: 14000,
      angle0: 0.6,
      ecc: 0.08,
      spinMs: 6000,
      size: Math.min(22, Math.max(16, w * 0.022)),
      fill: 'radial-gradient(circle at 32% 28%, #e7e5e4 0%, #a8a29e 45%, #57534e 100%)',
      glow: 'rgba(168,162,158,0.45)',
      ring: false,
      el: null,
      spinEl: null,
      x: 0,
      y: 0,
    },
    {
      kind: 'planet',
      name: 'Earth',
      orbitR: scale * 0.16,
      periodMs: 26000,
      angle0: 2.1,
      ecc: 0.06,
      spinMs: 11000,
      size: Math.min(28, Math.max(20, w * 0.028)),
      fill: 'radial-gradient(circle at 35% 28%, #bae6fd 0%, #38bdf8 40%, #1d4ed8 100%)',
      glow: 'rgba(56,189,248,0.45)',
      ring: false,
      isEarth: true,
      el: null,
      spinEl: null,
      x: 0,
      y: 0,
    },
    {
      kind: 'planet',
      name: 'Mars',
      orbitR: scale * 0.2,
      periodMs: 34000,
      angle0: 4.8,
      ecc: 0.09,
      spinMs: 10000,
      size: Math.min(24, Math.max(17, w * 0.024)),
      fill: 'radial-gradient(circle at 34% 30%, #fecaca 0%, #f87171 35%, #b91c1c 70%, #7f1d1d 100%)',
      glow: 'rgba(239,68,68,0.4)',
      ring: false,
      el: null,
      spinEl: null,
      x: 0,
      y: 0,
    },
    {
      kind: 'planet',
      name: 'Jupiter',
      orbitR: scale * 0.26,
      periodMs: 42000,
      angle0: 3.6,
      ecc: 0.05,
      spinMs: 9000,
      size: Math.min(50, Math.max(34, w * 0.046)),
      fill: 'radial-gradient(circle at 34% 30%, #fed7aa 0%, #fdba74 22%, #c2410c 48%, #9a3412 72%, #fbbf24 100%)',
      glow: 'rgba(251,146,60,0.45)',
      ring: false,
      el: null,
      spinEl: null,
      x: 0,
      y: 0,
    },
    {
      kind: 'planet',
      name: 'Saturn',
      orbitR: scale * 0.33,
      periodMs: 58000,
      angle0: 5.0,
      ecc: 0.09,
      spinMs: 16000,
      size: Math.min(38, Math.max(26, w * 0.036)),
      fill: 'radial-gradient(circle at 30% 28%, #fef3c7 0%, #fcd34d 40%, #d97706 100%)',
      glow: 'rgba(252,211,77,0.4)',
      ring: true,
      el: null,
      spinEl: null,
      x: 0,
      y: 0,
    },
  ]

  const moon: MoonBody = {
    kind: 'moon',
    name: 'Moon',
    orbitR: Math.min(48, Math.max(32, scale * 0.055)),
    periodMs: 9000,
    angle0: 1.1,
    size: Math.min(28, Math.max(18, w * 0.024)),
    el: null,
    setPhase: null,
    x: 0,
    y: 0,
  }

  return {
    sun: { x: sunX, y: sunY, size: sunSize, el: null },
    planets,
    moon,
  }
}

function orbitPoint(
  cx: number,
  cy: number,
  r: number,
  angle: number,
  ecc: number,
): { x: number; y: number } {
  // Mild ellipse: stretch X a little
  const rx = r * (1 + ecc)
  const ry = r * (1 - ecc * 0.55)
  return {
    x: cx + Math.cos(angle) * rx,
    y: cy + Math.sin(angle) * ry,
  }
}

/**
 * Soft star field + solar system: planets orbit the sun, moon orbits Earth,
 * bodies spin on their axes — sped up, but real-world hierarchy.
 */
export function LandingHeroMotion() {
  const rootRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const layer = layerRef.current
    if (!root || !layer) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = root.clientWidth
    let h = root.clientHeight
    let stars = spawnStars(Math.max(w, 1), Math.max(h, 1))
    let system = spawnSystem(Math.max(w, 1), Math.max(h, 1))
    let raf = 0
    let alive = true

    let tooltip: HTMLElement | null = null
    let hoveredName: string | null = null
    const setHovered = (name: string | null) => {
      hoveredName = name
    }

    const mount = () => {
      layer.replaceChildren()
      tooltip = createTooltipEl()
      hoveredName = null

      const sunEl = createSunEl(system.sun.size)
      system.sun.el = sunEl
      layer.appendChild(sunEl)
      enableCelestialHover(
        sunEl,
        'Sun',
        tooltip,
        () => ({ x: system.sun.x, y: system.sun.y, size: system.sun.size }),
        setHovered,
      )

      for (const p of system.planets) {
        const created = createPlanetEl(p.size, p.fill, p.glow, p.ring)
        p.el = created.wrap
        p.spinEl = created.spinEl
        layer.appendChild(created.wrap)
        enableCelestialHover(
          created.wrap,
          p.name,
          tooltip,
          () => ({ x: p.x, y: p.y, size: p.size }),
          setHovered,
        )
      }

      const moonCreated = createMoonEl(system.moon.size)
      system.moon.el = moonCreated.wrap
      system.moon.setPhase = moonCreated.setPhase
      layer.appendChild(moonCreated.wrap)
      enableCelestialHover(
        moonCreated.wrap,
        system.moon.name,
        tooltip,
        () => ({
          x: system.moon.x,
          y: system.moon.y,
          size: system.moon.size,
        }),
        setHovered,
      )

      for (const s of stars) {
        const el = createStarSvg(s.size, s.color, s.glow)
        s.el = el
        layer.appendChild(el)
      }

      layer.appendChild(tooltip)
    }

    const placeStatic = () => {
      const { sun, planets, moon } = system
      if (sun.el) {
        sun.el.style.opacity = '0.9'
        sun.el.style.transform = `translate3d(${sun.x - sun.size / 2}px, ${sun.y - sun.size / 2}px, 0)`
      }
      for (const p of planets) {
        const pos = orbitPoint(sun.x, sun.y, p.orbitR, p.angle0, p.ecc)
        p.x = pos.x
        p.y = pos.y
        if (p.el) {
          p.el.style.opacity = '0.85'
          p.el.style.transform = `translate3d(${p.x - p.size / 2}px, ${p.y - p.size / 2}px, 0)`
        }
      }
      const earth = planets.find((p) => p.isEarth) ?? planets[1]!
      const mPos = orbitPoint(earth.x, earth.y, moon.orbitR, moon.angle0, 0.04)
      moon.x = mPos.x
      moon.y = mPos.y
      const sunAngle = Math.atan2(sun.y - earth.y, sun.x - earth.x)
      const phaseAngle = moon.angle0 - sunAngle
      moon.setPhase?.(phaseAngle)
      if (moon.el) {
        const faceDeg = (sunAngle * 180) / Math.PI
        moon.el.style.transform = `translate3d(${moon.x - moon.size / 2}px, ${moon.y - moon.size / 2}px, 0) rotate(${faceDeg}deg)`
      }
      for (const s of stars) {
        if (!s.el) continue
        s.el.style.opacity = '0.55'
        s.el.style.transform = `translate3d(${s.homeX}px, ${s.homeY}px, 0)`
      }
    }

    mount()

    if (reduced) {
      placeStatic()
      return () => {
        layer.replaceChildren()
      }
    }

    const remount = () => {
      w = root.clientWidth
      h = root.clientHeight
      stars = spawnStars(Math.max(w, 1), Math.max(h, 1), Math.floor(w + h))
      system = spawnSystem(Math.max(w, 1), Math.max(h, 1))
      mount()
    }

    const ro = new ResizeObserver(remount)
    ro.observe(root)

    const MAX_STEP = 2.4

    const tick = (time: number) => {
      if (!alive) return
      const { sun, planets, moon } = system

      // Sun gently pulses (fixed center)
      if (sun.el) {
        const pulse = 1 + 0.04 * Math.sin(time / 3500)
        sun.el.style.opacity = String(0.88 + 0.08 * Math.sin(time / 4000))
        sun.el.style.transform = `translate3d(${sun.x - sun.size / 2}px, ${sun.y - sun.size / 2}px, 0) scale(${pulse})`
      }

      // Planets revolve around the sun + spin on axis
      for (const p of planets) {
        const angle = p.angle0 + (time / p.periodMs) * Math.PI * 2
        const pos = orbitPoint(sun.x, sun.y, p.orbitR, angle, p.ecc)
        p.x = pos.x
        p.y = pos.y

        if (p.el) {
          p.el.style.opacity = '0.9'
          p.el.style.transform = `translate3d(${p.x - p.size / 2}px, ${p.y - p.size / 2}px, 0)`
        }
        if (p.spinEl) {
          const spinDeg = ((time / p.spinMs) * 360) % 360
          p.spinEl.style.transform = `rotate(${spinDeg}deg)`
        }
      }

      // Moon revolves around Earth; phase from Sun–Earth–Moon angle
      const earth = planets.find((p) => p.isEarth) ?? planets[1]!
      const moonAngle = moon.angle0 + (time / moon.periodMs) * Math.PI * 2
      const mPos = orbitPoint(earth.x, earth.y, moon.orbitR, moonAngle, 0.05)
      moon.x = mPos.x
      moon.y = mPos.y

      const sunAngle = Math.atan2(sun.y - earth.y, sun.x - earth.x)
      // 0 when moon is between Earth & Sun (new); π when opposite (full)
      const phaseAngle = moonAngle - sunAngle
      moon.setPhase?.(phaseAngle)

      if (moon.el) {
        // Orient so the terminator faces the sun
        const faceDeg = (sunAngle * 180) / Math.PI
        moon.el.style.transform = `translate3d(${moon.x - moon.size / 2}px, ${moon.y - moon.size / 2}px, 0) rotate(${faceDeg}deg)`
      }

      // Keep tooltip locked above the hovered body as it orbits
      if (tooltip && hoveredName) {
        let cx = 0
        let cy = 0
        let sz = 24
        if (hoveredName === 'Sun') {
          cx = sun.x
          cy = sun.y
          sz = sun.size
        } else if (hoveredName === moon.name) {
          cx = moon.x
          cy = moon.y
          sz = moon.size
        } else {
          const p = planets.find((pl) => pl.name === hoveredName)
          if (p) {
            cx = p.x
            cy = p.y
            sz = p.size
          }
        }
        tooltip.textContent = hoveredName
        tooltip.style.opacity = '1'
        tooltip.style.transform = `translate3d(${cx}px, ${cy - sz / 2 - 28}px, 0) translateX(-50%)`
      }

      // Background stars keep soft ambient drift
      for (const s of stars) {
        if (!s.el) continue

        const floatX =
          Math.sin((time / s.breathMs) * Math.PI * 2 + s.phase) * s.driftAmp +
          Math.sin((time / s.wobbleMs) * Math.PI * 2 + s.phase * 0.7) * (s.driftAmp * 0.3)
        const floatY =
          Math.cos((time / (s.breathMs * 1.12)) * Math.PI * 2 + s.phase) * s.driftAmp * 0.85 +
          Math.cos((time / s.wobbleMs) * Math.PI * 2 + s.phase * 1.1) * (s.driftAmp * 0.28)

        const targetX = s.homeX + floatX
        const targetY = s.homeY + floatY
        let stepX = (targetX - s.x) * 0.08
        let stepY = (targetY - s.y) * 0.08
        const len = Math.hypot(stepX, stepY)
        if (len > MAX_STEP) {
          stepX = (stepX / len) * MAX_STEP
          stepY = (stepY / len) * MAX_STEP
        }
        s.x += stepX
        s.y += stepY

        const breath = 0.5 + 0.5 * Math.sin((time / s.breathMs) * Math.PI * 2 + s.phase)
        const twinkle =
          0.45 + 0.35 * (0.5 + 0.5 * Math.sin((time / s.twinkleMs) * Math.PI * 2 + s.phase))
        const wobble =
          1 + 0.07 * Math.sin((time / s.wobbleMs) * Math.PI * 2 + s.phase * 1.4)
        const spin = ((time / 1000) * s.spinDeg) % 360
        const scale = (0.88 + breath * 0.2) * wobble

        s.el.style.opacity = String(twinkle)
        s.el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${spin}deg) scale(${scale})`
      }

      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)

    return () => {
      alive = false
      window.cancelAnimationFrame(raf)
      ro.disconnect()
      layer.replaceChildren()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(ellipse_at_90%_20%,rgba(56,189,248,0.1),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_75%_45%,rgba(251,191,36,0.08),transparent_55%),radial-gradient(ellipse_at_90%_20%,rgba(56,189,248,0.08),transparent_45%)]"
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-amber-50 via-amber-50/85 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 dark:to-transparent"
      />
      <div ref={layerRef} className="pointer-events-none absolute inset-0" />
    </div>
  )
}
