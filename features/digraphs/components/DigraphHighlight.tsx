'use client'

export function DigraphHighlight({
  graphemes,
  digraph,
  className = '',
}: {
  graphemes: string[]
  digraph: string
  className?: string
}) {
  const target = digraph.toLowerCase()
  return (
    <span className={`inline-flex items-baseline tracking-wide ${className}`}>
      {graphemes.map((g, i) => {
        const isTeam = g.toLowerCase() === target
        return (
          <span
            key={`${g}-${i}`}
            className={
              isTeam
                ? 'mx-0.5 rounded-lg bg-gradient-to-b from-amber-400 to-orange-500 px-1.5 text-white shadow-sm'
                : 'text-inherit'
            }
          >
            {g}
          </span>
        )
      })}
    </span>
  )
}
