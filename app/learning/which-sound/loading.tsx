import { whichSoundTheme } from '@/features/which-sound/which-sound-theme'

export default function WhichSoundLoading() {
  return (
    <div className={whichSoundTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-violet-400" aria-hidden>
          /s/ ?
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading which sound?…</p>
      </div>
    </div>
  )
}
