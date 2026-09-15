import Link from 'next/link'
import { SoftReveal } from '@/components/motion/SoftReveal'

const PATHS = [
  {
    label: 'Learn',
    title: 'Courses at your pace',
    href: '/courses',
    body: 'Structured lessons without the rush.',
  },
  {
    label: 'Shop',
    title: 'Handmade craft',
    href: '/shop',
    body: 'Pottery, candles, wood — sales fund the school.',
  },
  {
    label: 'Gallery',
    title: 'Original art',
    href: '/gallery',
    body: 'Collect work from the Monalo studio.',
  },
  {
    label: 'Team',
    title: 'Hire freelancers',
    href: '/team',
    body: 'Design, code, and support that gives back.',
  },
  {
    label: 'Journal',
    title: 'Stories & ideas',
    href: '/blog',
    body: 'Quiet notes from writers and makers.',
  },
] as const

export default function LandingPageSections() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-20 px-4 pb-24 sm:space-y-28 sm:px-6 lg:px-8">
      {/* 1 — Mission */}
      <SoftReveal
        as="section"
        variant="scale"
        className="relative overflow-hidden rounded-3xl bg-[#0c0a09] px-6 py-14 text-[#fafaf9] sm:px-10 sm:py-16"
      >
        <div
          className="gallery-ambient-breathe pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(251,191,36,0.2),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(56,189,248,0.12),transparent_50%)]"
          aria-hidden
        />
        <SoftReveal lines variant="fade" className="relative mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#a8a29e]">MonAlo</p>
          <h2 className="mt-4 font-serif text-3xl leading-snug sm:text-4xl">
            One school. Many doors in.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#d6d3d1] sm:text-lg">
            Learn, buy craft, collect art, or hire the team — every path helps students grow at
            Monalo School.
          </p>
        </SoftReveal>
      </SoftReveal>

      {/* 2 — Paths */}
      <section id="paths" aria-labelledby="paths-heading">
        <SoftReveal lines className="mb-10 max-w-xl">
          <p className="text-sm font-semibold text-blue-600">Explore</p>
          <h2 id="paths-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            Choose how you arrive
          </h2>
          <p className="mt-2 text-content-secondary">
            Five surfaces of the same school — pick what fits today.
          </p>
        </SoftReveal>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PATHS.map((path, index) => (
            <SoftReveal key={path.href} as="li" delay={index * 90} variant="up" lines>
              <p className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                {path.label}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-content">
                <Link
                  href={path.href}
                  className="gallery-soft-link outline-none hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {path.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-content-secondary">{path.body}</p>
              <Link
                href={path.href}
                className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Open →
              </Link>
            </SoftReveal>
          ))}
        </ul>
      </section>

      {/* 3 — How it funds learning */}
      <section
        id="circle"
        aria-labelledby="circle-heading"
        className="border-y border-subtle py-14 sm:py-16"
      >
        <SoftReveal lines className="mb-10 max-w-xl">
          <p className="text-sm font-semibold text-blue-600">The circle</p>
          <h2 id="circle-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            How support becomes school
          </h2>
          <p className="mt-2 text-content-secondary">
            Purchases and projects return to classrooms, materials, and student studios.
          </p>
        </SoftReveal>
        <ol className="grid gap-10 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'You take part',
              body: 'Enroll, shop, collect art, or hire the team — whatever fits your moment.',
            },
            {
              step: '02',
              title: 'Makers are paid',
              body: 'Artists, craftspeople, and freelancers earn for real work.',
            },
            {
              step: '03',
              title: 'Learning continues',
              body: 'A share returns to Monalo programs so students keep creating.',
            },
          ].map((item, index) => (
            <SoftReveal key={item.step} as="li" delay={index * 120} variant="up" lines>
              <p className="font-serif text-3xl text-[#a8a29e]">{item.step}</p>
              <h3 className="mt-3 text-lg font-semibold text-content">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-secondary">{item.body}</p>
            </SoftReveal>
          ))}
        </ol>
      </section>

      {/* 4 — Calm learning */}
      <section id="learn" className="grid items-center gap-10 lg:grid-cols-2" aria-labelledby="learn-heading">
        <SoftReveal variant="left" lines>
          <p className="text-sm font-semibold text-blue-600">Learn</p>
          <h2 id="learn-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            Progress without the panic
          </h2>
          <p className="mt-4 leading-relaxed text-content-secondary">
            Courses and the kids learning playroom are built for steady growth — short sessions,
            clear paths, and room to breathe.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="gallery-soft-cta inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Explore courses
            </Link>
            <Link
              href="/learning"
              className="gallery-soft-cta inline-flex rounded-full border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-hover"
            >
              Kids learning
            </Link>
          </div>
        </SoftReveal>
        <SoftReveal
          delay={140}
          variant="scale"
          className="relative min-h-[15rem] overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100/80 to-amber-50 dark:from-sky-950/40 dark:to-amber-950/20"
        >
          <div className="absolute inset-0 flex items-end p-8">
            <p className="font-serif text-2xl text-content sm:text-3xl">Small steps. Real skill.</p>
          </div>
        </SoftReveal>
      </section>

      {/* 5 — Craft */}
      <SoftReveal
        as="section"
        id="craft"
        lines
        aria-labelledby="craft-heading"
        className="rounded-3xl border border-subtle bg-surface-muted/80 px-6 py-12 sm:px-10"
      >
        <p className="text-sm font-semibold text-blue-600">Craft shop</p>
        <h2 id="craft-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
          Handmade goods with a purpose
        </h2>
        <p className="mt-3 max-w-xl text-content-secondary">
          Gypsum pottery, candles, wood, and bamboo — shelves that quietly fund learning.
        </p>
        <Link
          href="/shop"
          className="gallery-soft-cta mt-6 inline-flex rounded-full border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-hover"
        >
          Browse the shop →
        </Link>
      </SoftReveal>

      {/* 6 — Gallery */}
      <section id="art" className="grid items-center gap-10 lg:grid-cols-2" aria-labelledby="art-heading">
        <SoftReveal
          variant="scale"
          className="relative order-2 min-h-[15rem] overflow-hidden rounded-3xl bg-[#0c0a09] lg:order-1"
        >
          <div
            className="gallery-ambient-breathe absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(244,114,182,0.2),transparent_55%)]"
            aria-hidden
          />
          <p className="absolute bottom-8 left-8 right-8 font-serif text-2xl text-[#fafaf9] sm:text-3xl">
            Art that funds learning.
          </p>
        </SoftReveal>
        <SoftReveal variant="left" lines className="order-1 lg:order-2">
          <p className="text-sm font-semibold text-blue-600">Gallery</p>
          <h2 id="art-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            Collect from the studio
          </h2>
          <p className="mt-4 leading-relaxed text-content-secondary">
            Original works from students and community artists — each sale supports Monalo
            programs.
          </p>
          <Link
            href="/gallery"
            className="gallery-soft-cta mt-6 inline-flex rounded-full bg-[#0c0a09] px-5 py-2.5 text-sm font-semibold text-[#fafaf9] hover:opacity-90"
          >
            View the gallery
          </Link>
        </SoftReveal>
      </section>

      {/* 7 — Join */}
      <SoftReveal
        as="section"
        id="join"
        variant="up"
        lines
        aria-labelledby="join-heading"
        className="rounded-3xl bg-surface-muted px-6 py-14 text-center sm:px-10 sm:py-16"
      >
        <p className="text-sm font-semibold text-blue-600">Begin</p>
        <h2 id="join-heading" className="mt-2 font-serif text-3xl text-content sm:text-4xl">
          Ready when you are
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-content-secondary">
          Create an account, wander the school home, or simply open a course. There is no rush.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="gallery-soft-cta inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start today
          </Link>
          <Link
            href="/home"
            className="gallery-soft-cta inline-flex rounded-full border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-hover"
          >
            School home
          </Link>
          <Link
            href="/about"
            className="gallery-soft-cta inline-flex rounded-full border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-hover"
          >
            About MonAlo
          </Link>
        </div>
      </SoftReveal>
    </div>
  )
}
