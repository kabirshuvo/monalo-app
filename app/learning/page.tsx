import type { Metadata } from 'next'
import KidsLearningHub from '@/features/learning/components/KidsLearningHub'
import type { LearningGameCard } from '@/lib/learning/kids-hub'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Kids Learning · MonAlo',
  description: 'Eco Penguin, Vowel Words, Digraphs, and Build the word — early reading play on MonAlo',
}

const GAMES: LearningGameCard[] = [
  {
    id: 'ecopenguin',
    title: 'Eco Penguin',
    blurb: 'Tap pictures, hear names, then play Which Is listening games.',
    href: '/learning/ecopenguin',
    accent: 'from-teal-400 to-emerald-500',
    badge: 'Vocab',
    live: true,
  },
  {
    id: 'vowel-words',
    title: 'Vowel Words',
    blurb: 'Short A E I O U — learn CVC words, then listen for the vowel.',
    href: '/learning/vowel-words',
    accent: 'from-violet-400 to-fuchsia-500',
    badge: 'Vowels',
    live: true,
  },
  {
    id: 'digraphs',
    title: 'Digraphs',
    blurb: 'sh, ch, th, wh — hear the team letters and pick the word.',
    href: '/learning/digraphs',
    accent: 'from-amber-400 to-orange-500',
    badge: 'Teams',
    live: true,
  },
  {
    id: 'build-the-word',
    title: 'Build the word',
    blurb: 'Hear a word, then tap letters to spell it yourself.',
    href: '/learning/build-the-word',
    accent: 'from-sky-400 to-indigo-500',
    badge: 'Spell',
    live: true,
  },
]

export default function KidsLearningPage() {
  return (
    <>
      <ActivityTracker type="learning" />
      <KidsLearningHub games={GAMES} />
    </>
  )
}
