'use client'

import { PHONICS_STICKERS } from '@/lib/learning/phonics-progress'
import { planetCard, planetTextDim, planetTextMuted } from '@/lib/learning/planet-theme'

type Props = {
  earnedIds: string[]
}

export default function EcoPenguinStickerStrip({ earnedIds }: Props) {
  const earned = new Set(earnedIds)

  return (
    <section className="space-y-3">
      <h3 className={`text-center text-sm font-bold uppercase tracking-widest ${planetTextDim}`}>
        Stickers
      </h3>
      <div className={`${planetCard} p-4 sm:p-5`}>
        <p className={`mb-4 text-center text-sm ${planetTextMuted}`}>
          Finish each Balloon letters set to earn a sticker gift.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {PHONICS_STICKERS.map((sticker) => {
            const has = earned.has(sticker.id)
            return (
              <div
                key={sticker.id}
                className={`flex w-[4.5rem] flex-col items-center gap-1 rounded-2xl border px-2 py-3 ${
                  has
                    ? 'border-amber-400/40 bg-amber-400/15'
                    : 'border-[#fafaf9]/10 bg-[#0c0a09]/40 opacity-50'
                }`}
                title={has ? sticker.label : `Locked · ${sticker.label}`}
              >
                <span className="text-2xl" aria-hidden>
                  {has ? sticker.emoji : '🔒'}
                </span>
                <span className="text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-[#d6d3d1]">
                  {has ? sticker.label : 'Locked'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
