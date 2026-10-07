'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { markGuestConvertShown, shouldShowGuestConvert } from '@/lib/learning/guest-try'

type Props = {
  className?: string
  /** Re-check when this value changes (e.g. mastery count). */
  refreshKey?: number | string
}

/** Soft convert banner for guests after a few free wins. */
export default function GuestConvertNudge({ className = '', refreshKey }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(shouldShowGuestConvert())
  }, [refreshKey])

  if (!show) return null

  return (
    <div
      className={`rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-50 ${className}`}
      role="status"
    >
      <p className="font-semibold">
        Nice work!{' '}
        <Link
          href="/login?callbackUrl=/learning"
          className="underline hover:text-[#fafaf9]"
          onClick={() => markGuestConvertShown()}
        >
          Sign in
        </Link>{' '}
        to save stickers and unlock more rooms.
      </p>
      <button
        type="button"
        className="mt-2 text-xs font-bold text-amber-200/80 underline"
        onClick={() => {
          markGuestConvertShown()
          setShow(false)
        }}
      >
        Keep trying free
      </button>
    </div>
  )
}
