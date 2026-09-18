import type { Metadata } from 'next'
import KidsLearningHub from '@/features/learning/components/KidsLearningHub'
import type { LearningGameCard } from '@/lib/learning/kids-hub'
import { LEARNING_PATH_STEPS, recommendNextRoom } from '@/lib/learning/learning-path'
import ActivityTracker from '@/components/points/ActivityTracker'
import { auth } from '@/lib/auth-server'
import { getBalloonLettersMastery, getEcoPenguinStickers } from '@/lib/points/service'

export const metadata: Metadata = {
  title: 'Eco Penguin · MonAlo',
  description:
    'Eco Penguin — kids early reading: letter sounds, blending, pictures, vowels, digraphs, and spelling',
}

const STEP_BY_ID = Object.fromEntries(LEARNING_PATH_STEPS.map((s) => [s.id, s.step])) as Record<
  string,
  number
>

const GAMES: LearningGameCard[] = [
  {
    id: 'letter-sounds',
    title: 'Letter sounds',
    blurb: 'S for sun — hear the word, then copy the sound.',
    href: '/learning/letter-sounds',
    accent: 'from-sky-300 to-blue-700',
    badge: 'Sounds',
    live: true,
    step: STEP_BY_ID['letter-sounds'],
  },
  {
    id: 'which-sound',
    title: 'Which sound?',
    blurb: 'Hear a sound, then tap the picture that starts with it.',
    href: '/learning/which-sound',
    accent: 'from-violet-300 to-violet-600',
    badge: 'Listen',
    live: true,
    step: STEP_BY_ID['which-sound'],
  },
  {
    id: 'balloon-letters',
    title: 'Balloon letters',
    blurb: 'Tap the matching balloon. Finish a set for a sticker.',
    href: '/learning/balloon-letters',
    accent: 'from-pink-300 to-sky-500',
    badge: 'Catch',
    live: true,
    step: STEP_BY_ID['balloon-letters'],
  },
  {
    id: 'blend-the-word',
    title: 'Blend the word',
    blurb: 'Hear c, a, t, then the word. Packs match your letter sets.',
    href: '/learning/blend-the-word',
    accent: 'from-cyan-300 to-cyan-600',
    badge: 'Blend',
    live: true,
    step: STEP_BY_ID['blend-the-word'],
  },
  {
    id: 'segment-the-word',
    title: 'Segment the word',
    blurb: 'Hear the word, then tap each sound in order.',
    href: '/learning/segment-the-word',
    accent: 'from-emerald-300 to-teal-600',
    badge: 'Break',
    live: true,
    step: STEP_BY_ID['segment-the-word'],
  },
  {
    id: 'ecopenguin',
    title: 'Explore',
    blurb: 'Tap pictures, hear names, then play Which Is. Try Pets and Farm!',
    href: '/learning/ecopenguin',
    accent: 'from-emerald-300 to-teal-600',
    badge: 'Pictures',
    live: true,
    step: STEP_BY_ID['ecopenguin'],
  },
  {
    id: 'vowel-words',
    title: 'Vowel Words',
    blurb: 'Short A E I O U — learn CVC words, then listen for the vowel.',
    href: '/learning/vowel-words',
    accent: 'from-amber-200 to-amber-600',
    badge: 'Vowels',
    live: true,
    step: STEP_BY_ID['vowel-words'],
  },
  {
    id: 'digraphs',
    title: 'Digraphs',
    blurb: 'sh, ch, th, wh — hear the team letters and pick the word.',
    href: '/learning/digraphs',
    accent: 'from-orange-300 to-orange-700',
    badge: 'Teams',
    live: true,
    step: STEP_BY_ID['digraphs'],
  },
  {
    id: 'build-the-word',
    title: 'Build the word',
    blurb: 'Hear a word, then tap letters to spell it yourself.',
    href: '/learning/build-the-word',
    accent: 'from-rose-300 to-red-700',
    badge: 'Spell',
    live: true,
    step: STEP_BY_ID['build-the-word'],
  },
  {
    id: 'read-a-story',
    title: 'Read a story',
    blurb: 'Short decodable stories — tap any word to hear it.',
    href: '/learning/read-a-story',
    accent: 'from-amber-300 to-orange-500',
    badge: 'Story',
    live: true,
    step: STEP_BY_ID['read-a-story'],
  },
]

export default async function KidsLearningPage() {
  const session = await auth()
  let earnedStickerIds: string[] = []
  let masteredBalloonKeys: string[] = []
  if (session?.user?.id) {
    const [stickers, balloons] = await Promise.all([
      getEcoPenguinStickers(session.user.id),
      getBalloonLettersMastery(session.user.id),
    ])
    earnedStickerIds = stickers.earnedIds
    masteredBalloonKeys = balloons.masteredKeys
  }

  const nextForYou = recommendNextRoom(masteredBalloonKeys, earnedStickerIds)

  return (
    <>
      <ActivityTracker type="learning" />
      <KidsLearningHub
        games={GAMES}
        earnedStickerIds={earnedStickerIds}
        nextForYou={nextForYou}
        signedIn={Boolean(session?.user?.id)}
      />
    </>
  )
}
