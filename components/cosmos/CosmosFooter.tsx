import Link from 'next/link'
import PlanetOrb from '@/components/cosmos/PlanetOrb'
import SunMark from '@/components/cosmos/SunMark'
import { ALL_BODIES } from '@/lib/cosmos/planets'

/** Sitewide footer: the full system as a compact map. */
export default function CosmosFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-auto border-t border-[var(--orbit-line)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-content" aria-label="MonAlo, home">
              <SunMark className="h-9 w-9" />
              <span className="font-serif text-2xl font-medium tracking-tight">MonAlo</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-content-muted">
              Light of the mind. An online school, and everything that orbits it.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
              {ALL_BODIES.map((b) => (
                <li key={b.id}>
                  <Link
                    href={b.href}
                    className="inline-flex items-center gap-2.5 text-sm text-content-secondary transition-colors hover:text-content"
                  >
                    <PlanetOrb planet={b} size={b.id === 'sun' ? 14 : 10} />
                    {b.section}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--orbit-line)] pt-6 text-sm text-content-muted sm:flex-row sm:justify-between">
          <p className="text-content-muted">© {year} Monalo School</p>
          <p className="text-content-muted">No pressure. No rush. Just progress you can feel.</p>
        </div>
      </div>
    </footer>
  )
}
