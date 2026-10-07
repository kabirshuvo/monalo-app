import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Rhyme time · Eco Penguin · MonAlo',
  description: 'Nursery listening — tap the two pictures that rhyme · Eco Penguin',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
