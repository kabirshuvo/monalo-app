'use client'

import Link from 'next/link'
import { letterSoundsTheme } from '@/features/letter-sounds/letter-sounds-theme'
import { LETTER_SOUNDS_BASE_PATH } from '@/lib/letter-sounds/constants'
import { ECO_PENGUIN_APP_NAME, LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

type Props = {
  children: React.ReactNode
  title?: string
  backHref?: string
}

export default function LetterSoundsShell({
  children,
  title,
  backHref = LEARNING_HUB_PATH,
}: Props) {
  return (
    <div className={letterSoundsTheme.shell}>
      <header className={letterSoundsTheme.header}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link href={backHref} className={`${letterSoundsTheme.btnSecondary} px-3 py-2 text-xs sm:text-sm`}>
              ← Back
            </Link>
            <Link
              href={LETTER_SOUNDS_BASE_PATH}
              className="truncate text-base font-extrabold text-emerald-950 sm:text-lg"
            >
              Letter sounds
            </Link>
          </div>
          <nav className="flex shrink-0 items-center gap-2 text-sm">
            <Link href={LEARNING_HUB_PATH} className="font-semibold text-emerald-800 hover:underline">
              {ECO_PENGUIN_APP_NAME}
            </Link>
            <Link
              href="/dashboard/learning"
              className="hidden font-semibold text-emerald-800 hover:underline sm:inline"
            >
              Courses
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-emerald-100 bg-gradient-to-r from-lime-50 to-sky-50 px-4 py-3 text-center">
            <h1 className="text-lg font-extrabold text-emerald-950 sm:text-xl">{title}</h1>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
