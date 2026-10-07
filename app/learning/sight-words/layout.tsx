import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Sight words · Eco Penguin · MonAlo',
  description: 'Stage 1 high-frequency words — hear the word, then tap it · Eco Penguin',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
