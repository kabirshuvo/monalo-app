'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CLASSROOM_BOARD_PATH,
  CLASSROOM_SWITCH_PATH,
  LEARNER_AVATARS,
  avatarEmoji,
} from '@/lib/classroom/constants'
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

type Classroom = {
  id: string
  name: string
  schoolName: string | null
  learners: Learner[]
} | null

type Props = {
  initialClassroom: Classroom
}

export default function ClassroomRoster({ initialClassroom }: Props) {
  const router = useRouter()
  const [classroom, setClassroom] = useState(initialClassroom)
  const [className, setClassName] = useState(initialClassroom?.name ?? '')
  const [schoolName, setSchoolName] = useState(initialClassroom?.schoolName ?? '')
  const [kidName, setKidName] = useState('')
  const [kidRoll, setKidRoll] = useState('')
  const [avatarKey, setAvatarKey] = useState('penguin')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveClass = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className, schoolName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setClassroom(data.classroom)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  const addKid = async () => {
    if (!kidName.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/classroom', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-learner',
          displayName: kidName,
          rollNo: kidRoll,
          avatarKey,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setKidName('')
      setKidRoll('')
      setClassroom((prev) =>
        prev
          ? { ...prev, learners: [...prev.learners, data.learner].sort((a, b) => a.displayName.localeCompare(b.displayName)) }
          : prev
      )
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  const removeKid = async (id: string) => {
    setBusy(true)
    try {
      const res = await fetch('/api/classroom', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove-learner', id }),
      })
      if (!res.ok) throw new Error('Failed')
      setClassroom((prev) =>
        prev ? { ...prev, learners: prev.learners.filter((l) => l.id !== id) } : prev
      )
      router.refresh()
    } catch {
      setError('Could not remove kid')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`${planetShell} mx-auto max-w-3xl space-y-8 px-4 py-8`}>
      <header className="space-y-2 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Classroom Mode</p>
        <h1 className="text-3xl font-extrabold text-[#fafaf9]">Your class roster</h1>
        <p className={`text-sm ${planetTextMuted}`}>
          One teacher phone — switch kids before each turn so progress stays separate.
        </p>
      </header>

      <section className={`${planetCard} space-y-4 p-6`}>
        <h2 className="text-lg font-bold text-[#fafaf9]">Class details</h2>
        <label className="block text-sm font-semibold text-[#d6d3d1]">
          Class name
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#fafaf9]/20 bg-[#0c0a09] px-3 py-2 text-[#fafaf9]"
            placeholder="Nursery A"
          />
        </label>
        <label className="block text-sm font-semibold text-[#d6d3d1]">
          School (optional)
          <input
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#fafaf9]/20 bg-[#0c0a09] px-3 py-2 text-[#fafaf9]"
            placeholder="MonAlo School"
          />
        </label>
        <button type="button" disabled={busy || !className.trim()} onClick={() => void saveClass()} className={planetBtn.sun}>
          {classroom ? 'Save class' : 'Create class'}
        </button>
      </section>

      {classroom && (
        <section className={`${planetCard} space-y-4 p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#fafaf9]">Kids ({classroom.learners.length})</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={CLASSROOM_SWITCH_PATH} className={planetBtnSecondary}>
                Who is playing?
              </Link>
              <Link href={CLASSROOM_BOARD_PATH} className={planetBtn.sun}>
                Class board
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {classroom.learners.map((kid) => (
              <div key={kid.id} className="flex items-center gap-3 rounded-2xl border border-[#fafaf9]/15 bg-[#0c0a09]/50 p-3">
                <span className="text-3xl" aria-hidden>
                  {avatarEmoji(kid.avatarKey)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[#fafaf9]">{kid.displayName}</p>
                  {kid.rollNo && <p className={`text-xs ${planetTextMuted}`}>Roll {kid.rollNo}</p>}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void removeKid(kid.id)}
                  className="text-xs font-bold text-rose-300 underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-[#fafaf9]/10 pt-4">
            <h3 className="font-bold text-[#fafaf9]">Add a kid</h3>
            <input
              value={kidName}
              onChange={(e) => setKidName(e.target.value)}
              className="w-full rounded-xl border border-[#fafaf9]/20 bg-[#0c0a09] px-3 py-2 text-[#fafaf9]"
              placeholder="Name"
            />
            <input
              value={kidRoll}
              onChange={(e) => setKidRoll(e.target.value)}
              className="w-full rounded-xl border border-[#fafaf9]/20 bg-[#0c0a09] px-3 py-2 text-[#fafaf9]"
              placeholder="Roll no (optional)"
            />
            <div className="flex flex-wrap gap-2">
              {LEARNER_AVATARS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setAvatarKey(a.key)}
                  className={`rounded-xl px-3 py-2 text-2xl ${
                    avatarKey === a.key ? 'ring-2 ring-amber-300' : 'opacity-70'
                  }`}
                  aria-label={a.label}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
            <button type="button" disabled={busy || !kidName.trim()} onClick={() => void addKid()} className={planetBtn.sun}>
              Add to roster
            </button>
          </div>
        </section>
      )}

      {error && (
        <p className="text-center text-sm font-semibold text-rose-300" role="alert">
          {error}
        </p>
      )}

      <p className="text-center">
        <Link href="/learning" className="text-sm font-bold text-sky-300 underline">
          ← Back to Eco Penguin
        </Link>
      </p>
    </div>
  )
}
