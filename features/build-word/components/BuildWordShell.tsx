'use client'

import Link from 'next/link'
import { buildWordTheme } from '@/features/build-word/build-word-theme'
import { BUILD_WORD_BASE_PATH } from '@/lib/build-word/session'
import { ECO_PENGUIN_APP_NAME, LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

type Props = {
  children: React.ReactNode
  title?: string
  backHref?: string
}

export default function BuildWordShell({
  children,
  title,
  backHref = LEARNING_HUB_PATH,
}: Props) {
  return (
    <div className={buildWordTheme.shell}>
      <header className={buildWordTheme.header}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link href={backHref} className={`${buildWordTheme.btnSecondary} px-3 py-2 text-xs sm:text-sm`}>
              ← Back
            </Link>
            <Link href={BUILD_WORD_BASE_PATH} className="truncate text-base font-extrabold text-[#fafaf9] sm:text-lg">
              Build the word
            </Link>
          </div>
          <nav className="flex shrink-0 items-center gap-2 text-sm">
            <Link href={LEARNING_HUB_PATH} className="font-semibold text-rose-300 hover:underline">
              {ECO_PENGUIN_APP_NAME}
            </Link>
            <Link
              href="/dashboard/learning"
              className="hidden font-semibold text-rose-300 hover:underline sm:inline"
            >
              Courses
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-[#fafaf9]/15 bg-rose-950/30 px-4 py-3 text-center">
            <h1 className="text-lg font-extrabold text-[#fafaf9]">{title}</h1>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
