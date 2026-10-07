import { consonantBlendsTheme } from '@/features/consonant-blends/consonant-blends-theme'

export default function ConsonantBlendsLoading() {
  return (
    <div className={consonantBlendsTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-4xl font-black tracking-widest text-orange-400" aria-hidden>
          st · fr
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading blends…</p>
      </div>
    </div>
  )
}
