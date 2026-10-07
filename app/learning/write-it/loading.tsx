import { writeItTheme } from '@/features/write-it/write-it-theme'

export default function WriteItLoading() {
  return (
    <div className={writeItTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-rose-400" aria-hidden>
          a · b · c
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading Write it…</p>
      </div>
    </div>
  )
}
