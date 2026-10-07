'use client'

import Link from 'next/link'
import { avatarEmoji, CLASSROOM_BOARD_PATH } from '@/lib/classroom/constants'
import {
  planetBtnSecondary,
  planetCard,
  planetShell,
  planetTextMuted,
} from '@/lib/learning/planet-theme'

type Props = {
  displayName: string
  avatarKey: string
  rollNo: string | null
  className: string
  schoolName: string | null
  stickers: string[]
  sightMastered: number
  sightTotal: number
  balloons: number
  stories: number
  nextTitle: string
  nextDetail: string
  dateLabel: string
}

/** Printable one-pager for parents without smartphones. */
export default function ProgressSlip({
  displayName,
  avatarKey,
  rollNo,
  className,
  schoolName,
  stickers,
  sightMastered,
  sightTotal,
  balloons,
  stories,
  nextTitle,
  nextDetail,
  dateLabel,
}: Props) {
  return (
    <div className={`${planetShell} mx-auto max-w-lg space-y-6 px-4 py-8 print:bg-white print:px-8 print:py-10 print:text-black`}>
      <header className="space-y-1 border-b border-[#fafaf9]/20 pb-4 print:border-stone-300">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300 print:text-stone-500">
          Eco Penguin · Progress slip
        </p>
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {avatarEmoji(avatarKey)}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-[#fafaf9] print:text-stone-900">{displayName}</h1>
            <p className={`text-sm ${planetTextMuted} print:text-stone-600`}>
              {className}
              {schoolName ? ` · ${schoolName}` : ''}
              {rollNo ? ` · Roll ${rollNo}` : ''}
            </p>
            <p className={`text-xs ${planetTextMuted} print:text-stone-500`}>{dateLabel}</p>
          </div>
        </div>
      </header>

      <section className={`${planetCard} space-y-2 p-5 print:border print:border-stone-300 print:bg-white`}>
        <h2 className="font-bold text-[#fafaf9] print:text-stone-900">This week</h2>
        <ul className={`space-y-1 text-sm ${planetTextMuted} print:text-stone-700`}>
          <li>Phonics stickers: {stickers.length ? stickers.join(', ') : 'None yet'}</li>
          <li>
            Sight words mastered: {sightMastered} / {sightTotal}
          </li>
          <li>Balloon letters: {balloons}</li>
          <li>Stories finished: {stories}</li>
        </ul>
      </section>

      <section className={`${planetCard} space-y-2 p-5 print:border print:border-stone-300 print:bg-white`}>
        <h2 className="font-bold text-[#fafaf9] print:text-stone-900">Practice tonight</h2>
        <p className="text-lg font-extrabold text-amber-200 print:text-stone-900">{nextTitle}</p>
        <p className={`text-sm ${planetTextMuted} print:text-stone-700`}>{nextDetail}</p>
      </section>

      <p className={`text-center text-xs ${planetTextMuted} print:text-stone-500`}>
        Show this slip to parents — no smartphone needed.
      </p>

      <div className="flex flex-wrap justify-center gap-3 print:hidden">
        <button type="button" onClick={() => window.print()} className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#0c0a09]">
          Print slip
        </button>
        <Link href={CLASSROOM_BOARD_PATH} className={planetBtnSecondary}>
          Class board
        </Link>
      </div>
    </div>
  )
}
