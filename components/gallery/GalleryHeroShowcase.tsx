'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { formatPriceCents } from '@/lib/format'
import type { ArtworkListItem } from '@/components/gallery/ArtworkCard'
import { GalleryHeroSideMotion } from '@/components/gallery/GalleryHeroSideMotion'
import { galleryHref } from '@/lib/urls'

function artistName(artwork: ArtworkListItem): string {
  return (
    artwork.artist.artistProfile?.displayName ||
    artwork.artist.name ||
    'Monalo artist'
  )
}

type GalleryHeroShowcaseProps = {
  artworks: ArtworkListItem[]
}

/** Always-light text on the dark hero — do not use `text-white` (remapped in dark mode). */
const heroInk = 'text-[#fafaf9]'
const heroMuted = 'text-[#a8a29e]'
const heroSoft = 'text-[#d6d3d1]'

const AUTO_ADVANCE_MS = 5600

export default function GalleryHeroShowcase({ artworks }: GalleryHeroShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const active = artworks[activeIndex]
  const total = artworks.length
  const canNavigate = total > 1
  const reduceMotionRef = useRef(false)

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!canNavigate || paused) return
    if (reduceMotionRef.current) return

    const id = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return
      setActiveIndex((index) => (index + 1) % total)
    }, AUTO_ADVANCE_MS)

    return () => window.clearInterval(id)
  }, [canNavigate, paused, total, activeIndex])

  const goPrev = () => {
    setActiveIndex((index) => (index - 1 + total) % total)
  }

  const goNext = () => {
    setActiveIndex((index) => (index + 1) % total)
  }

  if (!active) return null

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-3xl bg-[#0c0a09] shadow-xl"
        data-gallery-hero
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false)
          }
        }}
      >
        <GalleryHeroSideMotion featureKey={active.id} />

        <div className="relative flex min-h-[28rem] flex-col sm:min-h-[36rem]">
          <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
            <p className={`text-xs font-medium uppercase tracking-[0.2em] ${heroMuted}`}>Gallery</p>
            <p className={`text-sm font-semibold tracking-wide ${heroInk}`}>MonAlo</p>
            <p className={`text-xs ${heroMuted}`}>
              {activeIndex + 1} / {total}
            </p>
          </header>

          <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-8 sm:px-12 lg:px-40 xl:px-48">
            <div className="relative z-[2] mx-auto flex w-full max-w-3xl items-center gap-3 sm:gap-5">
              {canNavigate ? (
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous artwork"
                  className="gallery-soft-cta shrink-0 rounded-full border border-[#fafaf9]/35 p-2.5 text-[#fafaf9] hover:border-[#fafaf9]/80 hover:bg-[#fafaf9]/10 sm:p-3"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                    <path
                      d="M15 5 L8 12 L15 19"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}

              <div className="relative min-w-0 flex-1">
                <div
                  key={`glow-${active.id}`}
                  className="gallery-hero-art-pulse absolute -inset-8 rounded-[2rem] bg-[#fafaf9]/5 blur-2xl"
                  aria-hidden
                />
                <div
                  data-star-avoid
                  className="gallery-hero-frame relative mx-auto w-fit max-w-full"
                >
                  <span className="gallery-hero-frame-spin" aria-hidden />
                  <div className="gallery-hero-frame-inner relative overflow-hidden rounded-[3px] bg-[#0c0a09]">
                    {active.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={active.id}
                        src={active.imageUrl}
                        alt={active.title}
                        className="gallery-soft-crossfade relative mx-auto block max-h-[min(52vh,28rem)] w-auto max-w-full object-contain"
                      />
                    ) : (
                      <div
                        className={`relative flex aspect-[4/5] max-h-[28rem] min-w-[12rem] items-center justify-center bg-[#fafaf9]/10 ${heroMuted}`}
                      >
                        No image
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {canNavigate ? (
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next artwork"
                  className="gallery-soft-cta shrink-0 rounded-full border border-[#fafaf9]/35 p-2.5 text-[#fafaf9] hover:border-[#fafaf9]/80 hover:bg-[#fafaf9]/10 sm:p-3"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                    <path
                      d="M9 5 L16 12 L9 19"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          <div
            key={active.id}
            className="gallery-soft-crossfade relative z-10 grid gap-6 px-5 pb-8 sm:grid-cols-2 sm:items-end sm:px-8 sm:pb-10"
          >
            <div className="max-w-md space-y-3">
              <p className={`text-xs uppercase tracking-wider ${heroMuted}`}>Featured work</p>
              <h1 className={`!text-[#fafaf9] font-serif text-2xl leading-snug sm:text-3xl`}>
                {active.title}
                {active.medium ? (
                  <span className={`mt-1 block font-sans text-sm font-normal ${heroSoft}`}>
                    {active.medium}
                    {active.dimensions ? ` · ${active.dimensions}` : ''}
                    {active.year ? ` · ${active.year}` : ''}
                  </span>
                ) : null}
              </h1>
              <p className={`text-sm ${heroMuted}`}>{artistName(active)}</p>
              {active.description ? (
                <p className={`line-clamp-2 text-sm ${heroSoft}`}>{active.description}</p>
              ) : null}
              <Link
                href={`/gallery/${active.slug}`}
                className="gallery-soft-cta inline-flex items-center gap-2 rounded-full border border-[#fafaf9]/80 px-5 py-2 text-sm font-medium text-[#fafaf9] hover:bg-[#fafaf9] hover:text-[#0c0a09]"
              >
                View & purchase
                <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="sm:text-right">
              <p className={`text-xs uppercase tracking-wider ${heroMuted}`}>Starting at</p>
              <p className={`mt-1 !text-[#fafaf9] font-serif text-4xl sm:text-5xl`}>
                {formatPriceCents(active.price)}
              </p>
              <div className="mt-4 flex gap-2 sm:justify-end" role="tablist" aria-label="Artwork selection">
                {artworks.map((art, index) => (
                  <button
                    key={art.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Show ${art.title}`}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full border border-[#fafaf9]/80 transition-[background-color,transform] duration-500 ease-out ${
                      index === activeIndex
                        ? 'scale-110 bg-[#fafaf9]'
                        : 'bg-transparent hover:scale-110 hover:bg-[#fafaf9]/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Browse artworks">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <h2 className="text-lg font-semibold text-content">Browse the collection</h2>
          <p className="text-sm text-content-muted">Hover to pause · click to open the artwork</p>
        </div>
        <div
          className="gallery-browse-marquee -mx-4 px-4 py-1"
          style={
            {
              ['--gallery-browse-duration']: `${Math.max(36, artworks.length * 7)}s`,
            } as CSSProperties
          }
        >
          <div className="gallery-browse-marquee-track">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className="gallery-browse-marquee-set"
                aria-hidden={copy === 1 || undefined}
              >
                {artworks.map((art) => {
                  const clone = copy === 1
                  return (
                    <li key={`${copy}-${art.id}`} className="gallery-browse-marquee-item">
                      <Link
                        href={galleryHref(art.slug)}
                        tabIndex={clone ? -1 : 0}
                        className="gallery-soft-thumb group block w-full overflow-hidden rounded-2xl border border-subtle text-left hover:-translate-y-1 hover:border-gray-400 hover:shadow-sm"
                        aria-label={clone ? undefined : `View ${art.title}`}
                      >
                        <span className="block aspect-[4/5] bg-surface-muted">
                          {art.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={art.imageUrl}
                              alt=""
                              className="gallery-soft-media h-full w-full object-cover group-hover:scale-[1.04]"
                              draggable={false}
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-xs text-content-muted">
                              No image
                            </span>
                          )}
                        </span>
                        <span className="block space-y-0.5 bg-surface p-2.5">
                          <span className="line-clamp-1 text-sm font-medium text-content">
                            {art.title}
                          </span>
                          <span className="block text-xs text-content-muted">
                            {formatPriceCents(art.price)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
