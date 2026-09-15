import { vowelTheme } from '@/features/vowel-words/vowel-theme'

export default function VowelWordsLoading() {
  return (
    <div className={vowelTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-5xl font-black text-violet-600" aria-hidden>
          Aa
        </p>
        <p className="text-lg font-extrabold text-violet-950">Loading Vowel Words…</p>
      </div>
    </div>
  )
}
