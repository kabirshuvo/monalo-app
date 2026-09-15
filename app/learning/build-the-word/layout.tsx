import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Build the word · MonAlo',
  description: 'Spell short-vowel CVC words — Build the word on MonAlo',
}

export default function BuildWordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
