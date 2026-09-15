import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Explore · Eco Penguin · MonAlo',
  description: 'Eco Penguin Explore — tap pictures, hear names, then play Which Is listening games',
}

export default function EcoPenguinLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
