import Link from 'next/link'
import type { EcoPenguinParentProgress } from '@/lib/learning/eco-penguin-progress'

type Props = {
  progress: EcoPenguinParentProgress
  /** Compact strip for the kids hub; full card for the parent dashboard. */
  variant?: 'hub' | 'dashboard'
}

export default function EcoPenguinProgressCard({ progress, variant = 'dashboard' }: Props) {
  const earnedCount = progress.stickers.filter((s) => s.earned).length
  const groupsDone = progress.groups.filter((g) => g.status === 'done').length

  if (variant === 'hub') {
    return (
      <section className="rounded-3xl border border-[#fafaf9]/15 bg-[#1c1917]/80 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Your progress</p>
            <h2 className="mt-1 text-lg font-extrabold text-[#fafaf9]">
              {earnedCount}/4 stickers · {groupsDone}/4 letter sets
            </h2>
            <p className="mt-1 text-sm text-[#d6d3d1]">
              Blend {progress.blendMastered} · Segment {progress.segmentMastered} · Stories{' '}
              {progress.storiesCompleted}/{progress.storiesUnlocked || 0}
            </p>
          </div>
          <div className="flex gap-1.5" aria-label="Stickers earned">
            {progress.stickers.map((s) => (
              <span
                key={s.id}
                title={s.label}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                  s.earned ? 'bg-amber-400/25' : 'bg-[#292524] opacity-40'
                }`}
              >
                {s.emoji}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-violet-900">Kid progress</h3>
          <p className="text-sm text-violet-800/80">
            Stickers, letter sets, and words — what Eco Penguin has unlocked.
          </p>
        </div>
        <Link
          href={progress.hubHref}
          className="text-sm font-semibold text-violet-700 hover:text-violet-900"
        >
          Open Eco Penguin →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Stickers">
        {progress.stickers.map((s) => (
          <span
            key={s.id}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              s.earned
                ? 'bg-amber-100 text-amber-900'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <span aria-hidden>{s.emoji}</span>
            {s.label}
            {!s.earned ? ' (locked)' : ''}
          </span>
        ))}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {progress.groups.map((g) => (
          <li
            key={g.id}
            className="flex items-center justify-between rounded-xl border border-violet-100 bg-white/70 px-3 py-2 text-sm"
          >
            <span className="font-medium text-gray-800">{g.label}</span>
            <span
              className={
                g.status === 'done'
                  ? 'font-semibold text-emerald-700'
                  : g.status === 'active'
                    ? 'font-semibold text-sky-700'
                    : 'text-gray-400'
              }
            >
              {g.status === 'done' ? 'Done' : g.status === 'active' ? 'Playing' : 'Locked'}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <Link href={progress.blendHref} className="rounded-xl bg-white/80 px-2 py-3 hover:bg-white">
          <p className="text-2xl font-bold text-gray-900">{progress.blendMastered}</p>
          <p className="text-gray-600">Blend words</p>
        </Link>
        <Link href={progress.segmentHref} className="rounded-xl bg-white/80 px-2 py-3 hover:bg-white">
          <p className="text-2xl font-bold text-gray-900">{progress.segmentMastered}</p>
          <p className="text-gray-600">Segment</p>
        </Link>
        <Link href={progress.storyHref} className="rounded-xl bg-white/80 px-2 py-3 hover:bg-white">
          <p className="text-2xl font-bold text-gray-900">
            {progress.storiesCompleted}/{progress.storiesUnlocked || 0}
          </p>
          <p className="text-gray-600">Stories</p>
        </Link>
      </div>
    </div>
  )
}
