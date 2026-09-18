import { readStoryTheme } from '@/features/read-a-story/read-story-theme'

export default function ReadStoryLoading() {
  return (
    <div className={readStoryTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-amber-400" aria-hidden>
          Pip sat.
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading stories…</p>
      </div>
    </div>
  )
}
