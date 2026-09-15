import Link from 'next/link'
import { SoftReveal } from '@/components/motion/SoftReveal'

export default function HomePageSections() {
  return (
    <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:space-y-28 sm:py-20">
      {/* 1 — Why the school */}
      <SoftReveal
        as="section"
        variant="scale"
        className="relative overflow-hidden rounded-3xl bg-[#0c0a09] px-6 py-14 text-[#fafaf9] sm:px-10 sm:py-16"
      >
        <div
          className="gallery-ambient-breathe pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(251,191,36,0.18),transparent_55%),radial-gradient(ellipse_at_85%_90%,rgba(56,189,248,0.12),transparent_50%)]"
          aria-hidden
        />
        <SoftReveal lines variant="fade" className="relative mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#a8a29e]">
            Why Monalo School
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-snug sm:text-4xl">
            Learning sustained by craft and care
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#d6d3d1] sm:text-lg">
            Courses, handmade goods, art, and client work share one purpose: keep students creating
            and growing.
          </p>
        </SoftReveal>
      </SoftReveal>

      {/* 2 — Who it is for */}
      <section id="for-whom" aria-labelledby="for-whom-heading">
        <SoftReveal lines className="mb-10 max-w-xl">
          <p className="text-sm font-semibold text-blue-600">People</p>
          <h2 id="for-whom-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            Who finds a place here
          </h2>
          <p className="mt-2 text-content-secondary">
            Learners, guardians, makers, and clients — each with a gentle way in.
          </p>
        </SoftReveal>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Students',
              body: 'Take courses, track progress, and learn without pressure.',
              href: '/courses',
            },
            {
              title: 'Young explorers',
              body: 'Kids learning playroom — vowels, digraphs, and Eco Penguin.',
              href: '/learning',
            },
            {
              title: 'Supporters',
              body: 'Shop craft or collect art — your purchase funds programs.',
              href: '/shop',
            },
            {
              title: 'Artists',
              body: 'Share work in the gallery and reach collectors.',
              href: '/gallery',
            },
            {
              title: 'Clients',
              body: 'Hire Monalo freelancers; revenue returns to school.',
              href: '/team',
            },
            {
              title: 'Readers',
              body: 'Follow the journal for craft notes and school news.',
              href: '/blog',
            },
          ].map((item, index) => (
            <SoftReveal key={item.title} as="li" delay={index * 70} variant="up" lines>
              <h3 className="font-serif text-2xl text-content">
                <Link
                  href={item.href}
                  className="gallery-soft-link outline-none hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {item.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-content-secondary">{item.body}</p>
            </SoftReveal>
          ))}
        </ul>
      </section>

      {/* 3 — How a week feels */}
      <section
        id="rhythm"
        aria-labelledby="rhythm-heading"
        className="border-y border-subtle py-14 sm:py-16"
      >
        <SoftReveal lines className="mb-10 max-w-xl">
          <p className="text-sm font-semibold text-blue-600">Rhythm</p>
          <h2 id="rhythm-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            A quieter kind of progress
          </h2>
          <p className="mt-2 text-content-secondary">
            No streaks to protect — just habits you can keep.
          </p>
        </SoftReveal>
        <ol className="grid gap-10 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Arrive',
              body: 'Open a lesson, a shelf, or a painting when you have a few calm minutes.',
            },
            {
              step: '02',
              title: 'Stay a while',
              body: 'Finish something small. Leave when you are ready — we save your place.',
            },
            {
              step: '03',
              title: 'Come back',
              body: 'Return tomorrow or next week. The school is still here.',
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

      {/* 4 — Support loops */}
      <SoftReveal
        as="section"
        id="support"
        lines
        aria-labelledby="support-heading"
        className="rounded-3xl border border-subtle bg-surface-muted/80 px-6 py-12 sm:px-10"
      >
        <p className="text-sm font-semibold text-blue-600">Support</p>
        <h2 id="support-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
          Every surface gives back
        </h2>
        <p className="mt-3 max-w-2xl text-content-secondary">
          Craft sales, gallery purchases, course enrollments, and freelance projects each carry a
          share toward Monalo programs — so commerce and classroom stay linked.
        </p>
      </SoftReveal>

      {/* 5 — Studio note */}
      <section
        id="studio"
        className="grid items-center gap-10 lg:grid-cols-2"
        aria-labelledby="studio-heading"
      >
        <SoftReveal variant="left" lines>
          <p className="text-sm font-semibold text-blue-600">Studio</p>
          <h2 id="studio-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            Made by hands still learning
          </h2>
          <p className="mt-4 leading-relaxed text-content-secondary">
            Shop and gallery pieces come from students and community makers. Buying is both
            collecting and sponsoring.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="gallery-soft-cta inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Craft shop
            </Link>
            <Link
              href="/gallery"
              className="gallery-soft-cta inline-flex rounded-full border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-hover"
            >
              Gallery
            </Link>
          </div>
        </SoftReveal>
        <SoftReveal
          delay={140}
          variant="scale"
          className="relative min-h-[16rem] overflow-hidden rounded-3xl bg-[#0c0a09]"
        >
          <div
            className="gallery-ambient-breathe absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(251,191,36,0.22),transparent_55%)]"
            aria-hidden
          />
          <p className="absolute bottom-6 left-6 right-6 font-serif text-2xl text-[#fafaf9]">
            Your wall can help a classroom.
          </p>
        </SoftReveal>
      </section>

      {/* 6 — Team services */}
      <SoftReveal
        as="section"
        id="services"
        variant="up"
        lines
        aria-labelledby="services-heading"
        className="rounded-3xl bg-surface-muted px-6 py-12 sm:px-10"
      >
        <p className="text-sm font-semibold text-blue-600">Team</p>
        <h2 id="services-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
          Need software, design, or help?
        </h2>
        <p className="mt-3 max-w-xl text-content-secondary">
          The freelancing team takes real client work — fees support the school you just scrolled
          through.
        </p>
        <Link
          href="/team"
          className="gallery-soft-cta mt-6 inline-flex rounded-full border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-hover"
        >
          Meet the team →
        </Link>
      </SoftReveal>

      {/* 7 — Soft close before surface heroes */}
      <SoftReveal as="section" variant="fade" lines className="text-center">
        <p className="font-serif text-2xl text-content sm:text-3xl">
          Scroll on — each door opens into MonAlo.
        </p>
        <p className="mt-3 text-content-secondary">Blog, shop, gallery, team, and courses below.</p>
      </SoftReveal>
    </div>
  )
}
