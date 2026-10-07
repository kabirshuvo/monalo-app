'use client'

import Link from 'next/link'
import {
  CLASSROOM_BASE_PATH,
  CLASSROOM_BOARD_PATH,
  CLASSROOM_SWITCH_PATH,
  avatarEmoji,
} from '@/lib/classroom/constants'
import { planetBtnSecondary } from '@/lib/learning/planet-theme'

type Props = {
  learner: { id: string; displayName: string; avatarKey: string } | null
  hasClassroom: boolean
}

/** Banner on learning pages: current kid + switch / roster links. */
export default function ClassroomModeBar({ learner, hasClassroom }: Props) {
  if (!hasClassroom && !learner) {
    return (
      <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-sm text-amber-50">
        <Link href={CLASSROOM_BASE_PATH} className="font-bold underline hover:text-[#fafaf9]">
          Start Classroom Mode
        </Link>
        <span className="opacity-80"> — track each kid on this teacher phone</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-50">
      {learner ? (
        <>
          <span className="font-bold">
            <span aria-hidden>{avatarEmoji(learner.avatarKey)} </span>
            Playing: {learner.displayName}
          </span>
          <Link href={CLASSROOM_SWITCH_PATH} className={`${planetBtnSecondary} !px-3 !py-1 text-xs`}>
            Switch kid
          </Link>
        </>
      ) : (
        <>
          <span className="font-semibold">No kid selected</span>
          <Link href={CLASSROOM_SWITCH_PATH} className={`${planetBtnSecondary} !px-3 !py-1 text-xs`}>
            Who is playing?
          </Link>
        </>
      )}
      <Link href={CLASSROOM_BOARD_PATH} className="text-xs font-bold underline opacity-90 hover:text-[#fafaf9]">
        Class board
      </Link>
      <Link href={CLASSROOM_BASE_PATH} className="text-xs font-bold underline opacity-90 hover:text-[#fafaf9]">
        Roster
      </Link>
    </div>
  )
}
