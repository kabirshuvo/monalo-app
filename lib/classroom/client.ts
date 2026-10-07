'use client'

import { ACTIVE_LEARNER_COOKIE } from '@/lib/classroom/constants'

export function readActiveLearnerIdClient(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${ACTIVE_LEARNER_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export async function setActiveLearnerIdClient(learnerId: string | null): Promise<void> {
  await fetch('/api/classroom/active-learner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerProfileId: learnerId }),
  })
}
