import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Balloon letters · Eco Penguin · MonAlo',
  description: 'Hear a letter sound, then tap the matching rising balloon — Eco Penguin on MonAlo',
}

export default function BalloonLettersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
