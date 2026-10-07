import Link from 'next/link'
import PlanetOrb from '@/components/cosmos/PlanetOrb'
import { ALL_BODIES, SUN } from '@/lib/cosmos/planets'

/** Relative orb sizes for the chart — readable, not to scale. */
const CHART_SIZE: Record<string, number> = {
  sun: 64,
  mercury: 18,
  venus: 26,
  earth: 28,
  moon: 14,
  mars: 22,
  jupiter: 52,
  saturn: 40,
  uranus: 32,
  neptune: 30,
}

const CYCLE = [
  {
    title: 'You take part',
    body: 'Enrol in a course, buy a candle, collect a painting or hire the team.',
  },
  {
    title: 'Makers are paid',
    body: 'Artists, craftspeople and freelancers earn fairly for real work.',
  },
  {
    title: 'Learning continues',
    body: 'A share returns to the school, so students keep reading, making and growing.',
  },
]

export default function LandingPageSections() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-24 px-4 pb-24 sm:space-y-32 sm:px-6 lg:px-8">
      {/* The map — ordered outward from the sun */}
      <section aria-labelledby="map-heading" className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="map-heading" className="text-4xl font-normal leading-tight text-content sm:text-5xl">
            Ten places, one school
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-content-secondary">
            Listed by distance from the sun: from what the school is, out through everything that
            keeps it going, to the edge where you join.
          </p>
        </div>

        <ol className="relative">
          {/* The radius line that every body hangs from */}
          <span
            className="absolute bottom-8 left-[39px] top-8 w-px bg-[var(--orbit-line-strong)]"
            aria-hidden
          />
          {ALL_BODIES.map((b) => (
            <li key={b.id} className="relative">
              <Link
                href={b.href}
                className="group grid grid-cols-[80px_minmax(0,1fr)] items-center gap-4 rounded-3xl py-4 pr-4 transition-colors hover:bg-[var(--surface-hover)] sm:gap-6"
              >
                <span className="relative flex justify-center">
                  <span className="rounded-full bg-[var(--background)] p-1.5">
                    <PlanetOrb planet={b} size={CHART_SIZE[b.id] ?? 24} />
                  </span>
                </span>
                <span className="grid gap-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <span>
                    <span className="block font-serif text-2xl leading-tight text-content">{b.section}</span>
                    <span className="block text-sm text-content-muted">
                      {b.id === 'moon' ? 'Moon of Earth' : b.name}
                    </span>
                  </span>
                  <span className="text-[0.98rem] leading-relaxed text-content-secondary group-hover:text-content">
                    {b.blurb}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* The cycle — a genuine loop, so it's drawn as one */}
      <section
        aria-labelledby="cycle-heading"
        className="cosmos-panel relative overflow-hidden rounded-[2.5rem] px-6 py-16 sm:px-12 sm:py-20"
      >
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative mx-auto aspect-square w-full max-w-[22rem]" aria-hidden>
            <span className="absolute inset-0 rounded-full border border-[rgba(243,239,228,0.22)]" />
            <span className="absolute inset-[18%] rounded-full border border-dashed border-[rgba(243,239,228,0.14)]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <PlanetOrb planet={SUN} size={84} />
            </span>
            {CYCLE.map((step, i) => {
              const angle = -90 + i * 120
              const x = 50 + 50 * Math.cos((angle * Math.PI) / 180)
              const y = 50 + 50 * Math.sin((angle * Math.PI) / 180)
              return (
                <span
                  key={step.title}
                  className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(243,239,228,0.35)] bg-[#10153a] font-serif text-lg text-[#f3efe4]"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {i + 1}
                </span>
              )
            })}
          </div>

          <div>
            <h2 id="cycle-heading" className="text-4xl font-normal leading-tight text-[#f3efe4] sm:text-5xl">
              How support becomes school
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-[#d9d6e6]">
              Nothing here is a side business. Every planet sends something back to the sun.
            </p>
            <ol className="mt-10 space-y-7">
              {CYCLE.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4">
                  <span className="font-serif text-2xl leading-none text-[#ffb547]">{i + 1}</span>
                  <span>
                    <span className="block text-lg font-bold text-[#f3efe4]">{step.title}</span>
                    <span className="mt-1 block leading-relaxed text-[#bdbbd3]">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Join — a sunrise */}
      <section
        aria-labelledby="join-heading"
        className="relative overflow-hidden rounded-[2.5rem] border border-[var(--orbit-line)] px-6 pb-44 pt-16 text-center sm:pb-56 sm:pt-20"
      >
        <h2 id="join-heading" className="text-4xl font-normal leading-tight text-content sm:text-6xl">
          Ready when you are.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-content-secondary">
          Make a free account to save progress and earn points, or simply look around the school
          first. There&apos;s no rush.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center rounded-full bg-[var(--sun)] px-7 py-3.5 text-lg font-bold text-[var(--sun-ink)] shadow-[0_0_40px_rgba(255,181,71,0.35)] transition-colors hover:bg-[var(--sun-bright)]"
          >
            Start today
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center rounded-full border border-[var(--orbit-line-strong)] px-7 py-3.5 text-lg text-content transition-colors hover:bg-[var(--surface-hover)]"
          >
            Visit the school
          </Link>
        </div>

        {/* The sun rising over the panel's edge */}
        <span
          className="pointer-events-none absolute -bottom-[150px] left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full sm:-bottom-[210px] sm:h-[420px] sm:w-[420px]"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, #fffbea 0%, #ffd46b 28%, #ffb547 55%, #f08a24 100%)',
            boxShadow:
              '0 0 80px rgba(255,190,90,0.55), 0 0 200px rgba(255,160,50,0.3), 0 0 360px rgba(255,140,40,0.15)',
          }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-[260px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-[var(--orbit-line)] sm:-bottom-[350px] sm:h-[700px] sm:w-[700px]"
          aria-hidden
        />
      </section>
    </div>
  )
}
