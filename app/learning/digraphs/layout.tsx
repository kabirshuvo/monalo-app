import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Digraphs · Eco Penguin · MonAlo',
  description: 'Letter team digraph practice — Digraphs room in Eco Penguin on MonAlo',
}

export default function DigraphsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
