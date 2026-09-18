'use client'

import Link from 'next/link'
import { BALLOON_LETTERS_BASE_PATH } from '@/lib/balloon-letters/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

type Props = {
  title: string
  detail: string
  cardClassName: string
  btnClassName: string
}

/** Shown when Blend / Segment / Story need a balloon sticker first. */
export default function PhonicsLockedEmpty({ title, detail, cardClassName, btnClassName }: Props) {
  return (
    <div className={`${cardClassName} space-y-4 px-6 py-12 text-center sm:px-8`}>
      <p className="text-4xl" aria-hidden>
        🐧⭐
      </p>
      <h2 className="text-2xl font-extrabold text-[#fafaf9]">{title}</h2>
      <p className="mx-auto max-w-md text-sm leading-relaxed text-[#d6d3d1]">{detail}</p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link href={BALLOON_LETTERS_BASE_PATH} className={`${btnClassName} px-6 py-3`}>
          Catch balloons
        </Link>
        <Link
          href={LEARNING_HUB_PATH}
          className="rounded-2xl border border-[#fafaf9]/25 px-5 py-2.5 text-sm font-bold text-[#fafaf9] hover:bg-[#fafaf9]/10"
        >
          Eco Penguin hub
        </Link>
      </div>
    </div>
  )
}
