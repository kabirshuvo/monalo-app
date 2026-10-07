'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { avatarEmoji, CLASSROOM_BASE_PATH } from '@/lib/classroom/constants'
import { setActiveLearnerIdClient } from '@/lib/classroom/client'
import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetShell,
  planetTextMuted,
} from '@/lib/learning/planet-theme'

type Learner = {
  id: string
  displayName: string
  avatarKey: string
  rollNo: string | null
}

type Props = {
  learners: Learner[]
  activeLearnerId: string | null
}

export default function ClassroomSwitcher({ learners, activeLearnerId }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [active, setActive] = useState(activeLearnerId)

  const select = async (id: string) => {
    setBusy(true)
    try {
      await setActiveLearnerIdClient(id)
      setActive(id)
      router.push('/learning')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`${planetShell} mx-auto max-w-3xl space-y-6 px-4 py-8`}>
      <header className="space-y-2 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Classroom Mode</p>
        <h1 className="text-3xl font-extrabold text-[#fafaf9]">Who is playing?</h1>
        <p className={`text-sm ${planetTextMuted}`}>Tap a kid before they start Eco Penguin.</p>
      </header>

      {learners.length === 0 ? (
        <div className={`${planetCard} space-y-4 p-8 text-center`}>
          <p className="font-semibold text-[#fafaf9]">No kids on the roster yet.</p>
          <Link href={CLASSROOM_BASE_PATH} className={planetBtn.sun}>
            Add kids
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {learners.map((kid) => (
            <button
              key={kid.id}
              type="button"
              disabled={busy}
              onClick={() => void select(kid.id)}
              className={`${planetCard} p-5 transition hover:-translate-y-0.5 ${
                active === kid.id ? 'ring-2 ring-amber-300' : ''
              }`}
            >
              <span className="block text-5xl" aria-hidden>
                {avatarEmoji(kid.avatarKey)}
              </span>
              <span className="mt-3 block text-lg font-extrabold text-[#fafaf9]">{kid.displayName}</span>
              {kid.rollNo && <span className={`mt-1 block text-xs ${planetTextMuted}`}>Roll {kid.rollNo}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Link href={CLASSROOM_BASE_PATH} className={planetBtnSecondary}>
          Edit roster
        </Link>
        <Link href="/learning" className={planetBtnSecondary}>
          Hub
        </Link>
      </div>
    </div>
  )
}
