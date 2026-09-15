import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Digraphs · MonAlo',
  description: 'Letter team digraph practice for kids — Digraphs on MonAlo',
}

export default function DigraphsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
