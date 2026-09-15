import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Vowel Words · Eco Penguin · MonAlo',
  description: 'Short vowel CVC practice — Vowel Words room in Eco Penguin on MonAlo',
}

export default function VowelWordsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
