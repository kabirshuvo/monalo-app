import { blendWordTheme } from '@/features/blend-the-word/blend-word-theme'

export default function BlendWordLoading() {
  return (
    <div className={blendWordTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-cyan-400" aria-hidden>
          c a t
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading blend the word…</p>
      </div>
    </div>
  )
}
