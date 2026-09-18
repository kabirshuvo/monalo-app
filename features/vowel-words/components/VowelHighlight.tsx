'use client'

export function VowelHighlight({
  graphemes,
  vowelLetter,
  className = '',
}: {
  graphemes: string[]
  vowelLetter: string
  className?: string
}) {
  const vowel = vowelLetter.toLowerCase()
  return (
    <span className={`inline-flex items-baseline tracking-wide ${className}`}>
      {graphemes.map((g, i) => {
        const isVowel = g.toLowerCase() === vowel
        return (
          <span
            key={`${g}-${i}`}
            className={
              isVowel
                ? 'mx-0.5 rounded-lg bg-gradient-to-b from-amber-300 to-orange-400 px-1.5 text-[#fafaf9] shadow-sm'
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
