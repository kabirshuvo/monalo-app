import { ecoTheme } from '@/features/ecopenguin/eco-theme'

export default function EcoPenguinLoading() {
  return (
    <div className={ecoTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="animate-eco-pop text-5xl" aria-hidden>
          🐧
        </p>
        <p className="text-lg font-extrabold text-sky-950">Loading Eco Penguin…</p>
        <p className="text-sm text-sky-800/80">Getting your words ready</p>
      </div>
    </div>
  )
}
