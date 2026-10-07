'use client'

import Link from 'next/link'
import {
  CLASSROOM_BASE_PATH,
  CLASSROOM_SWITCH_PATH,
  avatarEmoji,
} from '@/lib/classroom/constants'
import { recommendNextRoom } from '@/lib/learning/learning-path'
import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetShell,
  planetTextMuted,
} from '@/lib/learning/planet-theme'

export type BoardKidRow = {
  id: string
  displayName: string
  avatarKey: string
  rollNo: string | null
  stickers: number
  sightMastered: number
  sightTotal: number
  balloons: number
  stories: number
  nextTitle: string
  slipHref: string
}

type Props = {
  className: string
  schoolName: string | null
  rows: BoardKidRow[]
}

export default function ClassroomBoard({ className, schoolName, rows }: Props) {
  return (
    <div className={`${planetShell} mx-auto max-w-4xl space-y-6 px-4 py-8 print:bg-white print:text-black`}>
      <header className="space-y-2 text-center print:text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300 print:text-stone-600">
          Class board
        </p>
        <h1 className="text-3xl font-extrabold text-[#fafaf9] print:text-stone-900">{className}</h1>
        {schoolName && <p className={`text-sm ${planetTextMuted} print:text-stone-600`}>{schoolName}</p>}
      </header>

      <div className="flex flex-wrap justify-center gap-3 print:hidden">
        <Link href={CLASSROOM_SWITCH_PATH} className={planetBtn.sun}>
          Who is playing?
        </Link>
        <Link href={CLASSROOM_BASE_PATH} className={planetBtnSecondary}>
          Edit roster
        </Link>
        <button type="button" onClick={() => window.print()} className={planetBtnSecondary}>
          Print board
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className={`${planetCard} space-y-2 p-5 print:border print:border-stone-300 print:bg-white print:shadow-none`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>
                {avatarEmoji(row.avatarKey)}
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-[#fafaf9] print:text-stone-900">{row.displayName}</h2>
                {row.rollNo && <p className={`text-xs ${planetTextMuted}`}>Roll {row.rollNo}</p>}
              </div>
            </div>
            <ul className={`space-y-1 text-sm ${planetTextMuted} print:text-stone-700`}>
              <li>Stickers: {row.stickers}</li>
              <li>
                Sight words: {row.sightMastered}/{row.sightTotal}
              </li>
              <li>Balloon letters: {row.balloons}</li>
              <li>Stories finished: {row.stories}</li>
              <li>Next: {row.nextTitle}</li>
            </ul>
            <Link href={row.slipHref} className={`${planetBtnSecondary} mt-2 inline-flex print:hidden`}>
              Progress slip
            </Link>
          </article>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="text-center font-semibold text-[#fafaf9]">Add kids on the roster first.</p>
      )}
    </div>
  )
}

/** Helper used by the board page to compute next room title. */
export function nextRoomTitleForKid(
  masteredBalloonKeys: string[],
  earnedStickerIds: string[],
  signals: Parameters<typeof recommendNextRoom>[2]
): string {
  return recommendNextRoom(masteredBalloonKeys, earnedStickerIds, signals).title
}
