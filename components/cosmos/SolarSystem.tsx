'use client'

import Link from 'next/link'
import { useState, type CSSProperties, type ReactNode } from 'react'
import PlanetOrb from '@/components/cosmos/PlanetOrb'
import { ALL_BODIES, MOON, PLANETS, SUN, planetStyle, type Planet, type PlanetId } from '@/lib/cosmos/planets'

type BindProps = {
  onPointerEnter: () => void
  onPointerLeave: () => void
  onFocus: () => void
  onBlur: () => void
}

type SolarSystemProps = {
  /** Headline copy rendered beside the orrery */
  children: ReactNode
}

/**
 * The landing orrery. Every body is a link to a part of the site.
 * Pointing at a body (or its entry in the index) holds the orbits still and
 * shows where it leads in the readout.
 */
export default function SolarSystem({ children }: SolarSystemProps) {
  const [activeId, setActiveId] = useState<PlanetId | null>(null)
  const active = activeId ? ALL_BODIES.find((b) => b.id === activeId) ?? SUN : null
  const shown = active ?? SUN

  const bind = (id: PlanetId): BindProps => ({
    onPointerEnter: () => setActiveId(id),
    onPointerLeave: () => setActiveId((cur) => (cur === id ? null : cur)),
    onFocus: () => setActiveId(id),
    onBlur: () => setActiveId((cur) => (cur === id ? null : cur)),
  })

  return (
    <div className="grid gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:grid-rows-[auto_1fr]">
      {/* Copy */}
      <div className="relative z-10 lg:col-start-1 lg:row-start-1 lg:self-end">{children}</div>

      {/* Readout + index */}
      <div className="relative z-10 lg:col-start-1 lg:row-start-2">
        <div
          className="rounded-3xl border border-[var(--orbit-line)] bg-[var(--glass)] p-5 backdrop-blur-md sm:p-6"
          aria-live="polite"
        >
          <div className="flex items-start gap-4">
            <PlanetOrb planet={shown} size={44} className="mt-1" />
            <div className="min-w-0">
              <p className="text-sm text-content-muted">
                {shown.id === 'sun' && !active ? 'Choose a planet to see where it leads' : shown.name}
              </p>
              <p className="mt-0.5 font-serif text-2xl leading-tight text-content">{shown.section}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-content-secondary">{shown.blurb}</p>
              <Link
                href={shown.href}
                className="mt-3 inline-flex items-center gap-2 rounded-full text-sm font-bold text-content-link underline-offset-4 hover:underline"
              >
                Go to {shown.section.toLowerCase() === 'start today' ? 'sign up' : shown.section}
              </Link>
            </div>
          </div>
        </div>

        <nav aria-label="Planets of MonAlo" className="mt-5 lg:hidden">
          <ul className="flex flex-wrap gap-2">
            {ALL_BODIES.map((b) => (
              <li key={b.id}>
                <Link
                  href={b.href}
                  {...bind(b.id)}
                  data-active={activeId === b.id ? 'true' : undefined}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--orbit-line)] py-1.5 pl-1.5 pr-3.5 text-sm text-content-secondary transition-colors hover:border-[var(--orbit-line-strong)] hover:text-content data-[active=true]:border-[var(--orbit-line-strong)] data-[active=true]:text-content"
                >
                  <PlanetOrb planet={b} size={b.id === 'sun' ? 18 : 14} />
                  {b.section}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Orrery */}
      <div className="relative row-start-2 mx-auto w-full max-w-[min(92vw,680px)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
        <div className="solar" data-paused={activeId ? 'true' : undefined}>
          {PLANETS.map((p) => (
            <Orbit key={p.id} planet={p} active={activeId === p.id} bind={bind} activeId={activeId} />
          ))}

          <Link
            href={SUN.href}
            className="solar-sun"
            aria-label={`${SUN.section}: ${SUN.blurb}`}
            data-active={activeId === 'sun' ? 'true' : undefined}
            {...bind('sun')}
          >
            <PlanetOrb planet={SUN} size="15cqw" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function Orbit({
  planet,
  active,
  activeId,
  bind,
}: {
  planet: Planet
  active: boolean
  activeId: PlanetId | null
  bind: (id: PlanetId) => BindProps
}) {
  const o = planet.orbit!
  const style = {
    ...planetStyle(planet),
    '--d': `${o.radius * 93}cqw`,
    '--period': `${o.period}s`,
    '--phase': String(o.phase),
  } as CSSProperties

  const isEarth = planet.id === 'earth'

  return (
    <div className="solar-orbit" style={style} data-active={active ? 'true' : undefined}>
      <div className="solar-carrier">
        {isEarth ? <MoonOrbit activeId={activeId} bind={bind} /> : null}
        <div className="solar-upright">
          <Link
            href={planet.href}
            className="solar-body"
            aria-label={`${planet.section} (${planet.name}): ${planet.blurb}`}
            data-active={active ? 'true' : undefined}
            data-moon-host={isEarth ? 'true' : undefined}
            {...bind(planet.id)}
          >
            <PlanetOrb planet={planet} size={`${o.size}cqw`} />
            <span className="solar-tag">{planet.section}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function MoonOrbit({
  activeId,
  bind,
}: {
  activeId: PlanetId | null
  bind: (id: PlanetId) => BindProps
}) {
  const o = MOON.orbit!
  const style = {
    '--md': '8.4cqw',
    '--period': `${o.period}s`,
    '--phase': String(o.phase),
  } as CSSProperties
  const active = activeId === 'moon'

  return (
    <div className="solar-moon-orbit" style={style}>
      <div className="solar-carrier">
        <div className="solar-upright" style={style}>
          <Link
            href={MOON.href}
            className="solar-body"
            style={{ minWidth: 26, minHeight: 26 }}
            aria-label={`${MOON.section} (${MOON.name}): ${MOON.blurb}`}
            data-active={active ? 'true' : undefined}
            {...bind('moon')}
          >
            <PlanetOrb planet={MOON} size={`${o.size}cqw`} />
          </Link>
        </div>
      </div>
    </div>
  )
}
