import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Write it · Eco Penguin · MonAlo',
  description: 'Stage 1 early writing — sentence tiles and letter tracing · Eco Penguin',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
