import Link from 'next/link'
import ArtworkCard, { type ArtworkListItem } from '@/components/gallery/ArtworkCard'
import { GalleryReveal } from '@/components/gallery/GalleryReveal'
import { formatPriceCents } from '@/lib/format'

function artistName(artwork: ArtworkListItem): string {
  return (
    artwork.artist.artistProfile?.displayName ||
    artwork.artist.name ||
    'Monalo artist'
  )
}

function groupByMedium(artworks: ArtworkListItem[]) {
  const map = new Map<string, ArtworkListItem[]>()
  for (const art of artworks) {
    const key = art.medium?.trim() || 'Other'
    const list = map.get(key) ?? []
    list.push(art)
    map.set(key, list)
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
}

function groupArtists(artworks: ArtworkListItem[]) {
  const map = new Map<
    string,
    { name: string; pieces: ArtworkListItem[]; cover: ArtworkListItem }
  >()
  for (const art of artworks) {
    const name = artistName(art)
    const existing = map.get(name)
    if (existing) {
      existing.pieces.push(art)
      continue
    }
    map.set(name, { name, pieces: [art], cover: art })
  }
  return [...map.values()].sort((a, b) => b.pieces.length - a.pieces.length)
}

type GalleryPageSectionsProps = {
  artworks: ArtworkListItem[]
}

export default function GalleryPageSections({ artworks }: GalleryPageSectionsProps) {
  const mediums = groupByMedium(artworks)
  const artists = groupArtists(artworks)
  const lowest = artworks.reduce((min, a) => (a.price < min.price ? a : min), artworks[0]!)

  return (
    <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
      {/* 1 — Why this gallery exists */}
      <GalleryReveal as="section" variant="scale" className="relative overflow-hidden rounded-3xl bg-[#0c0a09] px-6 py-14 text-[#fafaf9] sm:px-10 sm:py-16">
        <div
          className="gallery-ambient-breathe pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(251,191,36,0.18),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(56,189,248,0.12),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#a8a29e]">
            Why MonAlo Gallery
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-snug sm:text-4xl">
            Original art that funds learning
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#d6d3d1] sm:text-lg">
            Every purchase supports Monalo School — studio time, materials, and programs for
            students who create alongside the community.
          </p>
        </div>
      </GalleryReveal>

      {/* 2 — Full collection */}
      <section id="collection" aria-labelledby="collection-heading">
        <GalleryReveal lines className="mb-8 max-w-xl">
          <p className="text-sm font-semibold text-blue-600">Collection</p>
          <h2 id="collection-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            Works for sale
          </h2>
          <p className="mt-2 text-content-secondary">
            Browse the full set — open any piece for detail and purchase.
          </p>
        </GalleryReveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.map((artwork, index) => (
            <GalleryReveal key={artwork.id} delay={Math.min(index * 90, 450)} variant="up">
              <ArtworkCard artwork={artwork} />
            </GalleryReveal>
          ))}
        </div>
      </section>

      {/* 3 — Mediums */}
      <GalleryReveal
        as="section"
        id="mediums"
        aria-labelledby="mediums-heading"
        className="rounded-3xl border border-subtle bg-surface-muted/80 px-6 py-12 sm:px-10"
      >
        <div className="mb-8 max-w-xl">
          <p className="text-sm font-semibold text-blue-600">Mediums</p>
          <h2 id="mediums-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            Find your material
          </h2>
          <p className="mt-2 text-content-secondary">
            From watercolor washes to oil, print, and mixed media.
          </p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2">
          {mediums.map(([medium, pieces], index) => {
            const sample = pieces[0]!
            return (
              <GalleryReveal key={medium} as="li" delay={index * 80} variant="left">
                <Link
                  href={`/gallery/${sample.slug}`}
                  className="group flex gap-4 outline-none transition duration-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                    {sample.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sample.imageUrl}
                        alt=""
                        className="gallery-soft-media h-full w-full object-cover group-hover:scale-[1.06]"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 self-center">
                    <span className="gallery-soft-link block font-serif text-xl text-content group-hover:text-blue-600">
                      {medium}
                    </span>
                    <span className="mt-1 block text-sm text-content-muted">
                      {pieces.length} {pieces.length === 1 ? 'work' : 'works'}
                      {pieces.length > 1
                        ? ` · from ${formatPriceCents(Math.min(...pieces.map((p) => p.price)))}`
                        : ` · ${formatPriceCents(sample.price)}`}
                    </span>
                  </span>
                </Link>
              </GalleryReveal>
            )
          })}
        </ul>
      </GalleryReveal>

      {/* 4 — Artists */}
      <section id="artists" aria-labelledby="artists-heading">
        <GalleryReveal className="mb-8 max-w-xl">
          <p className="text-sm font-semibold text-blue-600">Artists</p>
          <h2 id="artists-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            Who makes the work
          </h2>
          <p className="mt-2 text-content-secondary">
            Students and community makers whose sales return to Monalo programs.
          </p>
        </GalleryReveal>
        <ul className="grid gap-8 sm:grid-cols-2">
          {artists.map((artist, index) => (
            <GalleryReveal key={artist.name} as="li" delay={index * 100} className="flex gap-5">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                {artist.cover.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={artist.cover.imageUrl}
                    alt=""
                    className="gallery-soft-media h-full w-full object-cover hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="min-w-0 self-center">
                <h3 className="font-serif text-2xl text-content">{artist.name}</h3>
                <p className="mt-1 text-sm text-content-muted">
                  {artist.pieces.length}{' '}
                  {artist.pieces.length === 1 ? 'piece' : 'pieces'} in the gallery
                </p>
                <Link
                  href={`/gallery/${artist.cover.slug}`}
                  className="gallery-soft-link mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View a work →
                </Link>
              </div>
            </GalleryReveal>
          ))}
        </ul>
      </section>

      {/* 5 — How buying works */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="border-y border-subtle py-14 sm:py-16"
      >
        <GalleryReveal className="mb-10 max-w-xl">
          <p className="text-sm font-semibold text-blue-600">Buying</p>
          <h2 id="how-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            From wall to classroom
          </h2>
          <p className="mt-2 text-content-secondary">
            A simple path — choose a work, check out, and know your purchase funds school.
          </p>
        </GalleryReveal>
        <ol className="grid gap-10 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Choose a piece',
              body: 'Feature it in the hero or open any work from the collection for size, medium, and price.',
            },
            {
              step: '02',
              title: 'Purchase securely',
              body: 'Sign in, confirm your order, and we coordinate fulfillment with the artist.',
            },
            {
              step: '03',
              title: 'Fund the school',
              body: 'Proceeds support Monalo learning — materials, teaching, and student studios.',
            },
          ].map((item, index) => (
            <GalleryReveal key={item.step} as="li" delay={index * 120} variant="up">
              <p className="font-serif text-3xl text-[#a8a29e]">{item.step}</p>
              <h3 className="mt-3 text-lg font-semibold text-content">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-secondary">{item.body}</p>
            </GalleryReveal>
          ))}
        </ol>
        {lowest ? (
          <GalleryReveal delay={280} variant="fade" className="mt-10 text-sm text-content-muted">
            Pieces currently start at{' '}
            <span className="font-medium text-content">{formatPriceCents(lowest.price)}</span>.
          </GalleryReveal>
        ) : null}
      </section>

      {/* 6 — Care & provenance */}
      <section
        id="care"
        aria-labelledby="care-heading"
        className="grid items-center gap-10 lg:grid-cols-2"
      >
        <GalleryReveal variant="left">
          <p className="text-sm font-semibold text-blue-600">Care</p>
          <h2 id="care-heading" className="mt-1 font-serif text-3xl text-content sm:text-4xl">
            Provenance & looking after your art
          </h2>
          <p className="mt-4 text-content-secondary leading-relaxed">
            Each listing shares medium, dimensions, and year when known. Hang away from direct sun
            when possible; works on paper appreciate a mat and glass. Questions before you buy? Open
            the artwork page — details live with the piece.
          </p>
        </GalleryReveal>
        <GalleryReveal delay={140} variant="scale" className="relative min-h-[16rem] overflow-hidden rounded-3xl bg-[#0c0a09]">
          {artworks[0]?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artworks[0].imageUrl}
              alt=""
              className="gallery-care-kenburns absolute inset-0 h-full w-full object-cover opacity-80"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/40 to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 font-serif text-2xl text-[#fafaf9]">
            Made to live with — not just browse past.
          </p>
        </GalleryReveal>
      </section>

      {/* 7 — Keep exploring */}
      <GalleryReveal
        as="section"
        id="explore"
        variant="up"
        aria-labelledby="explore-heading"
        className="rounded-3xl bg-surface-muted px-6 py-14 text-center sm:px-10 sm:py-16"
      >
        <p className="text-sm font-semibold text-blue-600">Keep going</p>
        <h2 id="explore-heading" className="mt-2 font-serif text-3xl text-content sm:text-4xl">
          More ways to support MonAlo
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-content-secondary">
          Craft shelves, courses, and stories sit alongside the gallery — same school, many doors.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="gallery-soft-cta inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Craft shop
          </Link>
          <Link
            href="/courses"
            className="gallery-soft-cta inline-flex rounded-full border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-hover"
          >
            Courses
          </Link>
          <Link
            href="/blog"
            className="gallery-soft-cta inline-flex rounded-full border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-hover"
          >
            Journal
          </Link>
          <Link
            href="/register"
            className="gallery-soft-cta inline-flex rounded-full border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-hover"
          >
            Join MonAlo
          </Link>
        </div>
      </GalleryReveal>
    </div>
  )
}
