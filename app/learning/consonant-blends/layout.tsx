import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Consonant blends · Eco Penguin · MonAlo',
  description: 'Stage 1 adjacent consonants — hear st, fr, nd and tap the picture · Eco Penguin',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
