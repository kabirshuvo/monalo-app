import type { CSSProperties } from 'react'
import { getPlanet, planetStyle, type Planet, type PlanetId } from '@/lib/cosmos/planets'

type PlanetOrbProps = {
  planet: Planet | PlanetId
  /** Diameter: a pixel number, or any CSS length (e.g. "4cqw") */
  size?: number | string
  className?: string
  /** Decorative by default; pass a label when the orb stands alone */
  label?: string
}

/** A shaded CSS sphere for any body in the MonAlo system. */
export default function PlanetOrb({ planet, size = 24, className = '', label }: PlanetOrbProps) {
  const p = typeof planet === 'string' ? getPlanet(planet) : planet
  const style = {
    ...planetStyle(p),
    '--s': typeof size === 'number' ? `${size}px` : size,
  } as CSSProperties

  return (
    <span
      className={`planet-orb ${className}`}
      data-ring={p.ring ? 'true' : undefined}
      data-sun={p.id === 'sun' ? 'true' : undefined}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
