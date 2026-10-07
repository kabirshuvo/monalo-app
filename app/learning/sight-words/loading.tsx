import { sightWordsTheme } from '@/features/sight-words/sight-words-theme'

export default function SightWordsLoading() {
  return (
    <div className={sightWordsTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-amber-400" aria-hidden>
          the · is
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading sight words…</p>
      </div>
    </div>
  )
}
