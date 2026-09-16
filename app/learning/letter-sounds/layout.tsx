import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Letter sounds · Eco Penguin · MonAlo',
  description: 'Hear all 26 letter sounds, then quiz — Letter sounds room in Eco Penguin on MonAlo',
}

export default function LetterSoundsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
