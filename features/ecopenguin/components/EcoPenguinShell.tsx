'use client'

import Link from 'next/link'
import { useStopEcoPenguinAudioOnUnmount } from '@/features/ecopenguin/hooks/useEcoPenguinAudio'
import { EcoPenguinUiProvider, useEcoPenguinUi } from '@/features/ecopenguin/context/EcoPenguinUiContext'
import { ecoTheme } from '@/features/ecopenguin/eco-theme'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'

type EcoPenguinShellProps = {
  children: React.ReactNode
  title?: string
  backHref?: string
}

function ShellChrome({
  children,
  title,
  backHref,
}: EcoPenguinShellProps) {
  useStopEcoPenguinAudioOnUnmount()
  const { muted, toggleMute } = useEcoPenguinUi()

  return (
    <div className={ecoTheme.shell}>
      <header className={ecoTheme.header}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href={backHref ?? ECO_PENGUIN_BASE_PATH}
              className={`${ecoTheme.btnSecondary} shrink-0 px-3 py-2.5 text-xs sm:text-sm`}
            >
              ← Back
            </Link>
            <Link
              href={ECO_PENGUIN_BASE_PATH}
              className="flex min-w-0 items-center gap-2 rounded-2xl bg-sky-50 px-2 py-1.5 sm:px-3"
            >
              <span className="text-3xl leading-none" aria-hidden>
                🐧
              </span>
              <span className="truncate text-base font-extrabold text-sky-950 sm:text-lg">
                Eco Penguin
              </span>
            </Link>
          </div>
          <nav className="flex shrink-0 items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <button
              type="button"
              onClick={toggleMute}
              className={`${ecoTheme.btnSecondary} min-h-11 min-w-11 px-3 py-2`}
              aria-label={muted ? 'Unmute sound' : 'Mute sound'}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <Link
              href="/dashboard/learning"
              className="rounded-xl px-2 py-1.5 font-semibold text-sky-800 hover:bg-sky-50 sm:px-3"
            >
              Learning
            </Link>
            <Link
              href="/dashboard"
              className="hidden rounded-xl px-2 py-1.5 font-semibold text-sky-800 hover:bg-sky-50 sm:inline sm:px-3"
            >
              Home
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 px-4 py-3 text-center">
            <h1 className="text-lg font-extrabold text-sky-950 sm:text-xl">{title}</h1>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}

export default function EcoPenguinShell(props: EcoPenguinShellProps) {
  return (
    <EcoPenguinUiProvider>
      <ShellChrome {...props} />
    </EcoPenguinUiProvider>
  )
}
