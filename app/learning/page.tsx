import type { Metadata } from 'next'
import KidsLearningHub from '@/features/learning/components/KidsLearningHub'
import type { LearningGameCard } from '@/lib/learning/kids-hub'
import { CAMBRIDGE_ESL_STAGES, CAMBRIDGE_ROOM_CHIPS } from '@/lib/learning/cambridge-esl'
import { LEARNING_PATH_STEPS, recommendNextRoom } from '@/lib/learning/learning-path'
import ActivityTracker from '@/components/points/ActivityTracker'
import { auth } from '@/lib/auth-server'
import { getEcoPenguinParentProgress } from '@/lib/learning/eco-penguin-progress'
import { getSightWords } from '@/lib/sight-words/data'
import {
  getBalloonLettersMastery,
  getBlendWordMastery,
  getConsonantBlendsMastery,
  getEcoPenguinStickers,
  getNurseryRhymeMastery,
  getReadStoryMastery,
  getSayItMastery,
  getSegmentWordMastery,
  getSightWordsMastery,
} from '@/lib/points/service'
import { getUnlockedStories } from '@/lib/read-a-story/data'
import { ECO_PENGUIN_PROGRAM } from '@/lib/learning/cambridge-esl'

export const metadata: Metadata = {
  title: 'Eco Penguin · MonAlo',
  description: `${ECO_PENGUIN_PROGRAM.positioning} — ${ECO_PENGUIN_PROGRAM.claim}`,
}

const STEP_BY_ID = Object.fromEntries(LEARNING_PATH_STEPS.map((s) => [s.id, s.step])) as Record<
  string,
  number
>

const GAMES: LearningGameCard[] = [
  {
    id: 'nursery-rhyme',
    title: 'Rhyme time',
    blurb: 'Hear two words — tap the pictures that rhyme.',
    href: '/learning/nursery-rhyme',
    accent: 'from-cyan-300 to-sky-600',
    badge: 'Rhyme',
    live: true,
    step: STEP_BY_ID['nursery-rhyme'],
    cambridgeChip: CAMBRIDGE_ESL_STAGES.nursery.chip,
  },
  {
    id: 'say-it',
    title: 'Say it',
    blurb: 'Listen, say the word or phrase out loud, then tap “I said it”.',
    href: '/learning/say-it',
    accent: 'from-emerald-300 to-teal-600',
    badge: 'Speak',
    live: true,
    step: STEP_BY_ID['say-it'],
    cambridgeChip: CAMBRIDGE_ROOM_CHIPS['say-it']!,
  },
  {
    id: 'letter-sounds',
    title: 'Letter sounds',
    blurb: 'S for sun — hear the word, then copy the sound.',
    href: '/learning/letter-sounds',
    accent: 'from-sky-300 to-blue-700',
    badge: 'Sounds',
    live: true,
    step: STEP_BY_ID['letter-sounds'],
    cambridgeChip: CAMBRIDGE_ESL_STAGES.letters.chip,
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
    cambridgeChip: CAMBRIDGE_ESL_STAGES.letters.chip,
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
    cambridgeChip: CAMBRIDGE_ESL_STAGES.letters.chip,
  },
  {
    id: 'blend-the-word',
    title: 'Blend the word',
    blurb: 'Hear c, a, t, then the word. Packs open after Balloon stickers.',
    href: '/learning/blend-the-word',
    accent: 'from-cyan-300 to-cyan-600',
    badge: 'Blend',
    live: true,
    step: STEP_BY_ID['blend-the-word'],
    cambridgeChip: CAMBRIDGE_ESL_STAGES['stage1-phonics'].chip,
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
    cambridgeChip: CAMBRIDGE_ESL_STAGES['stage1-phonics'].chip,
  },
  {
    id: 'sight-words',
    title: 'Sight words',
    blurb: 'the, is, can — hear the word, then tap it. Opens after SATPIN.',
    href: '/learning/sight-words',
    accent: 'from-amber-300 to-yellow-600',
    badge: 'Sight',
    live: true,
    step: STEP_BY_ID['sight-words'],
    cambridgeChip: CAMBRIDGE_ROOM_CHIPS['sight-words']!,
  },
  {
    id: 'write-it',
    title: 'Write it',
    blurb: 'Build short sentences with tiles, or finger-trace letters. Opens after SATPIN.',
    href: '/learning/write-it',
    accent: 'from-rose-300 to-red-700',
    badge: 'Write',
    live: true,
    step: STEP_BY_ID['write-it'],
    cambridgeChip: CAMBRIDGE_ROOM_CHIPS['write-it']!,
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
    cambridgeChip: CAMBRIDGE_ESL_STAGES.vocabulary.chip,
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
    cambridgeChip: CAMBRIDGE_ESL_STAGES['stage1-phonics'].chip,
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
    cambridgeChip: CAMBRIDGE_ESL_STAGES['stage1-phonics'].chip,
  },
  {
    id: 'consonant-blends',
    title: 'Consonant blends',
    blurb: 'st, fr, nd — adjacent consonants. Opens after MDGOCK.',
    href: '/learning/consonant-blends',
    accent: 'from-orange-200 to-rose-600',
    badge: 'Blends',
    live: true,
    step: STEP_BY_ID['consonant-blends'],
    cambridgeChip: CAMBRIDGE_ROOM_CHIPS['consonant-blends']!,
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
    cambridgeChip: CAMBRIDGE_ESL_STAGES['stage1-phonics'].chip,
  },
  {
    id: 'read-a-story',
    title: 'Read a story',
    blurb: 'Short decodable stories with sight words — unlock with Balloon stickers.',
    href: '/learning/read-a-story',
    accent: 'from-amber-300 to-orange-500',
    badge: 'Story',
    live: true,
    step: STEP_BY_ID['read-a-story'],
    cambridgeChip: CAMBRIDGE_ESL_STAGES['stage1-read'].chip,
  },
]

export default async function KidsLearningPage() {
  const session = await auth()
  let earnedStickerIds: string[] = []
  let masteredBalloonKeys: string[] = []
  let parentProgress = null
  let nextForYou = recommendNextRoom([], [])
  if (session?.user?.id) {
    const userId = session.user.id
    const { resolveLearnerScope } = await import('@/lib/classroom/celebrate-scope')
    const scope = await resolveLearnerScope(userId)
    const [stickers, balloons, progress, sight, rhyme, sayIt, consonant, blend, segment, stories, sightWords] =
      await Promise.all([
        getEcoPenguinStickers(userId, scope),
        getBalloonLettersMastery(userId, scope),
        getEcoPenguinParentProgress(userId, scope),
        getSightWordsMastery(userId, scope),
        getNurseryRhymeMastery(userId, scope),
        getSayItMastery(userId, scope),
        getConsonantBlendsMastery(userId, scope),
        getBlendWordMastery(userId, scope),
        getSegmentWordMastery(userId, scope),
        getReadStoryMastery(userId, scope),
        getSightWords(),
      ])
    earnedStickerIds = stickers.earnedIds
    masteredBalloonKeys = balloons.masteredKeys
    parentProgress = progress
    const unlockedStories = await getUnlockedStories(balloons.masteredKeys)
    nextForYou = recommendNextRoom(masteredBalloonKeys, earnedStickerIds, {
      nurseryRhymeMastered: rhyme.masteredKeys.length,
      sayItMastered: sayIt.masteredKeys.length,
      sightWordsMastered: sight.masteredKeys.length,
      sightWordsTotal: sightWords.length,
      consonantBlendsMastered: consonant.masteredKeys.length,
      storiesCompleted: stories.completedIds.length,
      storiesUnlocked: unlockedStories.length,
      blendMastered: blend.masteredKeys.length,
      segmentMastered: segment.masteredKeys.length,
    })
  }

  return (
    <>
      <ActivityTracker type="learning" />
      <KidsLearningHub
        games={GAMES}
        earnedStickerIds={earnedStickerIds}
        nextForYou={nextForYou}
        signedIn={Boolean(session?.user?.id)}
        parentProgress={parentProgress}
      />
    </>
  )
}
