import { sayItTheme } from '@/features/say-it/say-it-theme'

export default function SayItLoading() {
  return (
    <div className={sayItTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-emerald-400" aria-hidden>
          Hello!
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading Say it…</p>
      </div>
    </div>
  )
}
