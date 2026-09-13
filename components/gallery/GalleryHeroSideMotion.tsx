'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  homeX: number
  homeY: number
  x: number
  y: number
  size: number
  color: string
  glow: string
  phase: number
  breathMs: number
  driftAmp: number
  spinDeg: number
  twinkleMs: number
  wobbleMs: number
  collected: boolean
  orbitAngle: number
  orbitRadius: number
  el: SVGSVGElement | null
}

type AvoidRect = {
  left: number
  top: number
  right: number
  bottom: number
}

const PALETTE = [
  { color: '#fafaf9', glow: 'rgba(250,250,249,0.55)' },
  { color: '#38bdf8', glow: 'rgba(56,189,248,0.6)' },
  { color: '#f472b6', glow: 'rgba(244,114,182,0.6)' },
  { color: '#fbbf24', glow: 'rgba(251,191,36,0.6)' },
  { color: '#34d399', glow: 'rgba(52,211,153,0.55)' },
  { color: '#a78bfa', glow: 'rgba(167,139,250,0.6)' },
  { color: '#fb7185', glow: 'rgba(251,113,133,0.55)' },
  { color: '#22d3ee', glow: 'rgba(34,211,238,0.55)' },
  { color: '#a3e635', glow: 'rgba(163,230,53,0.55)' },
  { color: '#f97316', glow: 'rgba(249,115,22,0.55)' },
  { color: '#e879f9', glow: 'rgba(232,121,249,0.55)' },
  { color: '#67e8f9', glow: 'rgba(103,232,249,0.55)' },
  { color: '#fda4af', glow: 'rgba(253,164,175,0.5)' },
  { color: '#86efac', glow: 'rgba(134,239,172,0.5)' },
]

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function readAvoidRect(root: HTMLElement, section: HTMLElement): AvoidRect | null {
  const el = section.querySelector<HTMLElement>('[data-star-avoid]')
  if (!el) return null
  const origin = root.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  if (r.width < 8 || r.height < 8) return null
  const pad = 18
  return {
    left: r.left - origin.left - pad,
    top: r.top - origin.top - pad,
    right: r.right - origin.left + pad,
    bottom: r.bottom - origin.top + pad,
  }
}

function hitsAvoid(x: number, y: number, avoid: AvoidRect | null, size: number): boolean {
  if (!avoid) return false
  const cx = x + size / 2
  const cy = y + size / 2
  return cx >= avoid.left && cx <= avoid.right && cy >= avoid.top && cy <= avoid.bottom
}

/** Push a point to the nearest edge outside the artwork rect. */
function ejectFromAvoid(
  x: number,
  y: number,
  avoid: AvoidRect,
  size: number,
): { x: number; y: number } {
  const cx = x + size / 2
  const cy = y + size / 2
  const dl = Math.abs(cx - avoid.left)
  const dr = Math.abs(avoid.right - cx)
  const dt = Math.abs(cy - avoid.top)
  const db = Math.abs(avoid.bottom - cy)
  const min = Math.min(dl, dr, dt, db)
  if (min === dl) return { x: avoid.left - size - 4, y }
  if (min === dr) return { x: avoid.right + 4, y }
  if (min === dt) return { x, y: avoid.top - size - 4 }
  return { x, y: avoid.bottom + 4 }
}

function randomPointOutside(
  rand: () => number,
  w: number,
  h: number,
  avoid: AvoidRect | null,
  size: number,
): { x: number; y: number } {
  for (let attempt = 0; attempt < 40; attempt++) {
    const x = rand() * Math.max(w - size, 1)
    const y = rand() * Math.max(h - size, 1)
    if (!hitsAvoid(x, y, avoid, size)) return { x, y }
  }
  // Fallback: park in a side margin
  if (avoid) {
    const leftSide = avoid.left > w - avoid.right
    return {
      x: leftSide ? Math.max(4, avoid.left * rand() * 0.6) : Math.min(w - size - 4, avoid.right + rand() * 40),
      y: rand() * Math.max(h - size, 1),
    }
  }
  return { x: rand() * w, y: rand() * h }
}

function makeStar(
  rand: () => number,
  x: number,
  y: number,
  size?: number,
): Particle {
  const palette = PALETTE[Math.floor(rand() * PALETTE.length)]!
  const s = size ?? 10 + Math.floor(rand() * 10)
  return {
    homeX: x,
    homeY: y,
    x,
    y,
    size: s,
    color: palette.color,
    glow: palette.glow,
    phase: rand() * Math.PI * 2,
    breathMs: 5500 + rand() * 4500,
    driftAmp: 6 + rand() * 12,
    spinDeg: (rand() < 0.5 ? -1 : 1) * (6 + rand() * 16), // deg / sec
    twinkleMs: 3200 + rand() * 4200,
    wobbleMs: 4200 + rand() * 5000,
    collected: false,
    orbitAngle: rand() * Math.PI * 2,
    orbitRadius: 10 + rand() * 22,
    el: null,
  }
}

function spawnStars(
  seedKey: string,
  w: number,
  h: number,
  avoid: AvoidRect | null,
): Particle[] {
  const rand = mulberry32(hashSeed(seedKey))
  const count = 22 + Math.floor(rand() * 10)
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    const size = 10 + Math.floor(rand() * 10)
    const point = randomPointOutside(rand, w, h, avoid, size)
    particles.push(makeStar(rand, point.x, point.y, size))
  }
  return particles
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      'a, button, input, textarea, select, label, [role="button"], [data-star-avoid]',
    ),
  )
}

function applyStarVisual(p: Particle, time: number, baseScale: number, baseOpacity: number) {
  if (!p.el) return
  const twinkle =
    0.72 + 0.28 * (0.5 + 0.5 * Math.sin((time / p.twinkleMs) * Math.PI * 2 + p.phase))
  const wobble =
    1 + 0.06 * Math.sin((time / p.wobbleMs) * Math.PI * 2 + p.phase * 1.4)
  const spin = ((time / 1000) * p.spinDeg) % 360
  p.el.style.opacity = String(baseOpacity * twinkle)
  p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${spin}deg) scale(${baseScale * wobble})`
  p.el.style.filter = ''
}

function createStarSvg(size: number, color: string, glow: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('aria-hidden', 'true')
  svg.classList.add('gallery-hero-dot', 'absolute', 'left-0', 'top-0')
  svg.style.filter = `drop-shadow(0 0 ${Math.max(6, size * 0.7)}px ${glow})`
  svg.style.willChange = 'transform, opacity'

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute(
    'd',
    'M12 2 L13.2 9.2 L20.5 10.5 L13.2 11.8 L12 19 L10.8 11.8 L3.5 10.5 L10.8 9.2 Z',
  )
  path.setAttribute('fill', color)
  svg.appendChild(path)
  return svg
}

type GalleryHeroSideMotionProps = {
  featureKey: string
}

/**
 * Idle pointer → stars slowly attract / gather, then vanish + respawn.
 * Moving pointer → stars gently repel.
 * Move again after an idle gather → all stars vanish, then respawn.
 * Click blank space → spawn a small burst of stars (kept until idle clear).
 */
export function GalleryHeroSideMotion({ featureKey }: GalleryHeroSideMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const layer = layerRef.current
    if (!root || !layer) return

    const section = root.closest('[data-gallery-hero]') as HTMLElement | null
    if (!section) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = root.clientWidth
    let h = root.clientHeight
    let avoid = readAvoidRect(root, section)
    let particles = spawnStars(featureKey, Math.max(w, 1), Math.max(h, 1), avoid)
    const cursor = { x: w / 2, y: h / 2, active: false }
    let lastMoveAt = 0
    let wasIdleGather = false
    let raf = 0
    let alive = true
    let clearing = false
    let clearStartedAt = 0
    let respawnAt = 0
    let spawnVersion = 0

    const remount = (seed: string) => {
      avoid = readAvoidRect(root, section)
      particles = spawnStars(seed, Math.max(w, 1), Math.max(h, 1), avoid)
      layer.replaceChildren()
      for (const p of particles) {
        const el = createStarSvg(p.size, p.color, p.glow)
        p.el = el
        layer.appendChild(el)
      }
      wasIdleGather = false
    }

    remount(featureKey)

    if (reduced) {
      for (const p of particles) {
        if (!p.el) continue
        p.el.style.opacity = '0.75'
        p.el.style.transform = `translate3d(${p.homeX}px, ${p.homeY}px, 0)`
      }
      return () => {
        layer.replaceChildren()
      }
    }

    const mountStar = (p: Particle) => {
      const el = createStarSvg(p.size, p.color, p.glow)
      p.el = el
      el.style.opacity = '0'
      layer.appendChild(el)
      particles.push(p)
    }

    const beginClear = (at: number) => {
      if (clearing || particles.length === 0) return
      clearing = true
      clearStartedAt = at
      respawnAt = at + 1400
      wasIdleGather = false
      for (const p of particles) {
        p.collected = true
      }
    }

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      cursor.x = event.clientX - rect.left
      cursor.y = event.clientY - rect.top
      cursor.active = true

      // After an idle gather, the next move clears every star at once
      if (wasIdleGather && !clearing && particles.length > 0) {
        beginClear(performance.now())
      }

      lastMoveAt = performance.now()
    }
    const onLeave = () => {
      cursor.active = false
      wasIdleGather = false
    }

    const onClick = (event: PointerEvent) => {
      if (event.button !== 0) return
      if (clearing) return
      if (isInteractiveTarget(event.target)) return

      const rect = root.getBoundingClientRect()
      const cx = event.clientX - rect.left
      const cy = event.clientY - rect.top
      avoid = readAvoidRect(root, section)

      // Don't spawn on the artwork even if the avoid marker missed the hit test
      if (hitsAvoid(cx - 6, cy - 6, avoid, 12)) return

      const rand = mulberry32(hashSeed(`click:${cx.toFixed(0)}:${cy.toFixed(0)}:${Date.now()}`))
      const burst = 3 + Math.floor(rand() * 3) // 3–5 stars
      const m = 8

      for (let i = 0; i < burst; i++) {
        const size = 10 + Math.floor(rand() * 10)
        const angle = rand() * Math.PI * 2
        const spread = 8 + rand() * 36
        let x = cx - size / 2 + Math.cos(angle) * spread
        let y = cy - size / 2 + Math.sin(angle) * spread

        if (hitsAvoid(x, y, avoid, size) && avoid) {
          const ejected = ejectFromAvoid(x, y, avoid, size)
          x = ejected.x
          y = ejected.y
        }

        x = Math.min(Math.max(x, m), Math.max(w - size - m, m))
        y = Math.min(Math.max(y, m), Math.max(h - size - m, m))

        mountStar(makeStar(rand, x, y, size))
      }

      cursor.x = cx
      cursor.y = cy
      cursor.active = true
      lastMoveAt = performance.now()
    }

    section.addEventListener('pointermove', onMove)
    section.addEventListener('pointerleave', onLeave)
    section.addEventListener('pointerdown', onClick)

    const refreshLayout = () => {
      w = root.clientWidth
      h = root.clientHeight
      spawnVersion += 1
      clearing = false
      remount(`${featureKey}:${w}x${h}:${spawnVersion}`)
    }
    const ro = new ResizeObserver(refreshLayout)
    ro.observe(root)
    const art = section.querySelector('[data-star-avoid]')
    if (art) ro.observe(art)
    section.querySelectorAll('img[data-star-avoid]').forEach((img) => {
      img.addEventListener('load', refreshLayout)
    })

    const PICKUP_RADIUS = 42
    const REPEL_RADIUS = 150
    const IDLE_AFTER_MS = 1300
    // After a short gather, idle pointer clears + respawns (no per-click retirement)
    const IDLE_CLEAR_MS = 2800

    const tick = (time: number) => {
      if (!alive) return
      avoid = readAvoidRect(root, section)

      if (clearing) {
        const elapsed = time - clearStartedAt
        const fade = Math.max(0, 1 - elapsed / 900)
        for (const p of particles) {
          if (!p.el) continue
          const burst = 1 + (1 - fade) * 1.8
          p.el.style.opacity = String(fade * 0.9)
          p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${burst})`
          p.el.style.filter = `blur(${(1 - fade) * 8}px)`
        }
        if (elapsed >= 900 && time >= respawnAt) {
          clearing = false
          spawnVersion += 1
          remount(`${featureKey}:respawn:${spawnVersion}`)
        }
        raf = window.requestAnimationFrame(tick)
        return
      }

      const idleMs = lastMoveAt > 0 ? time - lastMoveAt : 0
      const idleGather = cursor.active && idleMs > IDLE_AFTER_MS

      if (idleGather) {
        wasIdleGather = true
      }

      // Stay idle long enough → vanish and respawn a fresh set
      if (idleGather && idleMs >= IDLE_CLEAR_MS) {
        beginClear(time)
        raf = window.requestAnimationFrame(tick)
        return
      }

      let collectedCount = 0

      for (const p of particles) {
        const breath = 0.5 + 0.5 * Math.sin((time / p.breathMs) * Math.PI * 2 + p.phase)

        // Release collected stars once the pointer is moving again (repulsion).
        // Reset home to the current spot so they don't rocket across the hero.
        if (p.collected && cursor.active && !idleGather && !clearing) {
          p.collected = false
          p.homeX = p.x
          p.homeY = p.y
        }

        if (p.collected) {
          collectedCount += 1
          const swirl = time * 0.00035 + p.orbitAngle
          let targetX = cursor.x + Math.cos(swirl) * p.orbitRadius
          let targetY = cursor.y + Math.sin(swirl) * p.orbitRadius
          if (hitsAvoid(targetX, targetY, avoid, p.size) && avoid) {
            const ejected = ejectFromAvoid(targetX, targetY, avoid, p.size)
            targetX = ejected.x
            targetY = ejected.y
          }
          p.x += (targetX - p.x) * 0.14
          p.y += (targetY - p.y) * 0.14
          applyStarVisual(p, time, 0.95 + breath * 0.12, 0.75 + breath * 0.25)
          continue
        }

        if (hitsAvoid(p.homeX, p.homeY, avoid, p.size) && avoid && !idleGather) {
          const safe = ejectFromAvoid(p.homeX, p.homeY, avoid, p.size)
          p.homeX = safe.x
          p.homeY = safe.y
        }

        // Layered float — figure-8 wander so stars feel alive at rest
        const floatX =
          Math.sin((time / p.breathMs) * Math.PI * 2 + p.phase) * p.driftAmp +
          Math.sin((time / p.wobbleMs) * Math.PI * 2 + p.phase * 0.7) * (p.driftAmp * 0.35)
        const floatY =
          Math.cos((time / (p.breathMs * 1.15)) * Math.PI * 2 + p.phase) * p.driftAmp * 0.85 +
          Math.cos((time / p.wobbleMs) * Math.PI * 2 + p.phase * 1.1) * (p.driftAmp * 0.3)
        let targetX = p.homeX + floatX
        let targetY = p.homeY + floatY
        let follow = 0.09

        if (cursor.active) {
          const dx = cursor.x - p.x
          const dy = cursor.y - p.y
          const dist = Math.hypot(dx, dy) || 1

          if (idleGather) {
            // Idle → slow attract / gather
            const calmPull = 0.012 + Math.min(0.02, 4 / dist)
            targetX = p.homeX + floatX + dx * calmPull
            targetY = p.homeY + floatY + dy * calmPull
            p.homeX += dx * 0.004
            p.homeY += dy * 0.004
            follow = 0.045

            if (dist < PICKUP_RADIUS) {
              p.collected = true
              p.orbitAngle = Math.atan2(p.y - cursor.y, p.x - cursor.x)
              p.orbitRadius = 12 + Math.random() * 20
              collectedCount += 1
              continue
            }
          } else {
            // Moving → soft repulsion (keep home nearby to avoid later streaks)
            if (dist < REPEL_RADIUS) {
              const strength = (1 - dist / REPEL_RADIUS) ** 1.4
              const push = strength * 28
              targetX = p.x - (dx / dist) * push + floatX * 0.5
              targetY = p.y - (dy / dist) * push + floatY * 0.5
              follow = 0.08
              p.homeX += (-dx / dist) * strength * 0.1
              p.homeY += (-dy / dist) * strength * 0.1
            }
          }
        }

        if (!idleGather && hitsAvoid(targetX, targetY, avoid, p.size) && avoid) {
          const ejected = ejectFromAvoid(targetX, targetY, avoid, p.size)
          targetX = ejected.x
          targetY = ejected.y
        }

        // Cap travel per frame so nothing streaks from the top
        const MAX_STEP = 3.2
        let stepX = (targetX - p.x) * follow
        let stepY = (targetY - p.y) * follow
        const stepLen = Math.hypot(stepX, stepY)
        if (stepLen > MAX_STEP) {
          stepX = (stepX / stepLen) * MAX_STEP
          stepY = (stepY / stepLen) * MAX_STEP
        }
        p.x += stepX
        p.y += stepY

        if (!idleGather && hitsAvoid(p.x, p.y, avoid, p.size) && avoid) {
          const ejected = ejectFromAvoid(p.x, p.y, avoid, p.size)
          p.x = ejected.x
          p.y = ejected.y
        }

        // Keep inside the hero bounds
        const m = 8
        p.x = Math.min(Math.max(p.x, m), Math.max(w - p.size - m, m))
        p.y = Math.min(Math.max(p.y, m), Math.max(h - p.size - m, m))
        p.homeX = Math.min(Math.max(p.homeX, m), Math.max(w - p.size - m, m))
        p.homeY = Math.min(Math.max(p.homeY, m), Math.max(h - p.size - m, m))

        const scale = 0.88 + breath * 0.22
        const opacity = 0.55 + breath * 0.4
        applyStarVisual(p, time, scale, opacity)
      }

      if (particles.length > 0 && collectedCount >= particles.length) {
        beginClear(time)
      }

      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)

    return () => {
      alive = false
      window.cancelAnimationFrame(raf)
      ro.disconnect()
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
      section.removeEventListener('pointerdown', onClick)
      section.querySelectorAll('img[data-star-avoid]').forEach((img) => {
        img.removeEventListener('load', refreshLayout)
      })
      layer.replaceChildren()
    }
  }, [featureKey])

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      <div ref={layerRef} className="absolute inset-0" />
    </div>
  )
}
