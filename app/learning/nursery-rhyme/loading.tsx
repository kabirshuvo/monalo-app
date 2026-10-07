import { nurseryRhymeTheme } from '@/features/nursery-rhyme/nursery-rhyme-theme'

export default function NurseryRhymeLoading() {
  return (
    <div className={nurseryRhymeTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-cyan-400" aria-hidden>
          cat · hat
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading rhyme time…</p>
      </div>
    </div>
  )
}
