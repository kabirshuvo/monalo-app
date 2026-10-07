import { useId } from 'react'

/** MonAlo mark: the sun (alo, light) with one planet in orbit. */
export default function SunMark({ className = 'h-8 w-8' }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <radialGradient id={`sun-${id}`} cx="0.4" cy="0.36" r="0.7">
          <stop offset="0" stopColor="#fffbea" />
          <stop offset="0.35" stopColor="#ffd46b" />
          <stop offset="0.7" stopColor="#ffb547" />
          <stop offset="1" stopColor="#f08a24" />
        </radialGradient>
      </defs>
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="8.5"
        transform="rotate(-20 20 20)"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />
      <circle cx="20" cy="20" r="8" fill={`url(#sun-${id})`} />
      <circle cx="35.6" cy="13.6" r="2.6" fill="#7fd9d2" />
    </svg>
  )
}
