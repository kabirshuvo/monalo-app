import type { Metadata } from 'next'
import KidsLearningHub from '@/features/learning/components/KidsLearningHub'
import type { LearningGameCard } from '@/lib/learning/kids-hub'
import ActivityTracker from '@/components/points/ActivityTracker'
import { auth } from '@/lib/auth-server'
import { getEcoPenguinStickers } from '@/lib/points/service'

export const metadata: Metadata = {
  title: 'Eco Penguin · MonAlo',
  description:
    'Eco Penguin — kids early reading: letter sounds, blending, pictures, vowels, digraphs, and spelling',
}

const GAMES: LearningGameCard[] = [
  {
    id: 'letter-sounds',
    title: 'Letter sounds',
    blurb: 'S for sun — hear the word, then copy the sound. Built for kids learning English.',
    href: '/learning/letter-sounds',
    accent: 'from-sky-300 to-blue-700',
    badge: 'Sounds',
    live: true,
  },
  {
    id: 'balloon-letters',
    title: 'Balloon letters',
    blurb: 'Hear a letter, then tap the matching balloon as it floats up. Finish a set for a sticker.',
    href: '/learning/balloon-letters',
    accent: 'from-pink-300 to-sky-500',
    badge: 'Catch',
    live: true,
  },
  {
    id: 'blend-the-word',
    title: 'Blend the word',
    blurb: 'Hear c, a, t, then the word. Tap the picture that matches.',
    href: '/learning/blend-the-word',
    accent: 'from-cyan-300 to-cyan-600',
    badge: 'Blend',
    live: true,
  },
  {
    id: 'ecopenguin',
    title: 'Explore',
    blurb: 'Tap pictures, hear names, then play Which Is listening games.',
    href: '/learning/ecopenguin',
    accent: 'from-emerald-300 to-teal-600',
    badge: 'Pictures',
    live: true,
  },
  {
    id: 'vowel-words',
    title: 'Vowel Words',
    blurb: 'Short A E I O U — learn CVC words, then listen for the vowel.',
    href: '/learning/vowel-words',
    accent: 'from-amber-200 to-amber-600',
    badge: 'Vowels',
    live: true,
  },
  {
    id: 'digraphs',
    title: 'Digraphs',
    blurb: 'sh, ch, th, wh — hear the team letters and pick the word.',
    href: '/learning/digraphs',
    accent: 'from-orange-300 to-orange-700',
    badge: 'Teams',
    live: true,
  },
  {
    id: 'build-the-word',
    title: 'Build the word',
    blurb: 'Hear a word, then tap letters to spell it yourself.',
    href: '/learning/build-the-word',
    accent: 'from-rose-300 to-red-700',
    badge: 'Spell',
    live: true,
  },
]

export default async function KidsLearningPage() {
  const session = await auth()
  let earnedStickerIds: string[] = []
  if (session?.user?.id) {
    const stickers = await getEcoPenguinStickers(session.user.id)
    earnedStickerIds = stickers.earnedIds
  }

  return (
    <>
      <ActivityTracker type="learning" />
      <KidsLearningHub games={GAMES} earnedStickerIds={earnedStickerIds} />
    </>
  )
}
