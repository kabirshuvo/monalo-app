import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Say it · Eco Penguin · MonAlo',
  description: 'Stage 1 ESL speaking — listen and repeat words and phrases · Eco Penguin',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
