export const BALLOON_LETTERS_BASE_PATH = '/learning/balloon-letters'

/** Starter set: SATPIN — same first group as Letter sounds. */
export const BALLOON_LETTER_IDS = ['s', 'a', 't', 'p', 'i', 'n'] as const

export const BALLOON_COUNT = 5

export type BalloonLetterId = (typeof BALLOON_LETTER_IDS)[number]
