import { segmentWordTheme } from '@/features/segment-the-word/segment-word-theme'

export default function SegmentWordLoading() {
  return (
    <div className={segmentWordTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-emerald-400" aria-hidden>
          c · a · t
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading segment the word…</p>
      </div>
    </div>
  )
}
