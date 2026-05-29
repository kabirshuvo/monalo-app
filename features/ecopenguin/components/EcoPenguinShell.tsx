'use client'

import Link from 'next/link'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'

type EcoPenguinShellProps = {
  children: React.ReactNode
  title?: string
  backHref?: string
}

export default function EcoPenguinShell({
  children,
  title,
  backHref = ECO_PENGUIN_BASE_PATH,
}: EcoPenguinShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-teal-50 to-emerald-100">
      <header className="sticky top-0 z-20 border-b border-teal-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={backHref}
              className="text-sm font-medium text-teal-800 hover:text-teal-950 shrink-0"
            >
              ← Back
            </Link>
            <Link href={ECO_PENGUIN_BASE_PATH} className="flex items-center gap-2 min-w-0">
              <span className="text-2xl" aria-hidden>
                🐧
              </span>
              <span className="font-bold text-teal-900 truncate">Eco Penguin</span>
            </Link>
          </div>
          <nav className="flex items-center gap-3 text-sm shrink-0">
            <Link href="/dashboard" className="text-teal-700 hover:text-teal-900">
              MonAlo
            </Link>
            <Link href="/profile" className="text-teal-700 hover:text-teal-900">
              Profile
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-teal-100 bg-teal-50/50 px-4 py-2 text-center">
            <h1 className="text-lg font-semibold text-teal-900">{title}</h1>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
