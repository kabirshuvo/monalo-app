import { digraphTheme } from '@/features/digraphs/digraph-theme'

export default function DigraphsLoading() {
  return (
    <div className={digraphTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-5xl font-black text-orange-300" aria-hidden>
          sh
        </p>
        <p className="text-lg font-extrabold text-[#fafaf9]">Loading Digraphs…</p>
      </div>
    </div>
  )
}
