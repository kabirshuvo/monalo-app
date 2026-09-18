import { letterSoundsTheme } from '@/features/letter-sounds/letter-sounds-theme'

export default function LetterSoundsLoading() {
  return (
    <div className={letterSoundsTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-sky-400" aria-hidden>
          s a t
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading letter sounds…</p>
      </div>
    </div>
  )
}
