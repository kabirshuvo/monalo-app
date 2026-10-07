'use client'

type Props = {
  /** 0–100 closeness score */
  score: number | null
  listening?: boolean
  label?: string
}

/**
 * Guitar-tuner-style meter for speech closeness (not pitch).
 * Needle sits at center when the score is near the pass band.
 */
export default function SpeechTunerMeter({ score, listening = false, label }: Props) {
  const value = score ?? (listening ? 35 : 0)
  // Map 0–100 → needle rotation −45° … +45°
  const rotation = -45 + (Math.max(0, Math.min(100, value)) / 100) * 90
  const inTune = score !== null && score >= 65

  return (
    <div className="mx-auto w-full max-w-xs" aria-live="polite">
      <div className="relative mx-auto h-28 w-52 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 h-24 rounded-t-full border border-[#fafaf9]/20 bg-[#0c0a09]/60"
          aria-hidden
        />
        {/* green pass band */}
        <div
          className="absolute bottom-0 left-1/2 h-24 w-16 -translate-x-1/2 bg-emerald-400/20"
          aria-hidden
        />
        <div
          className="absolute bottom-1 left-1/2 h-[5.5rem] w-1 origin-bottom rounded-full bg-amber-300 shadow-lg transition-transform duration-300"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          aria-hidden
        />
        <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#fafaf9]" aria-hidden />
      </div>
      <p className="mt-2 text-center text-sm font-bold text-[#fafaf9]">
        {listening
          ? 'Listening… speak now'
          : score === null
            ? 'Tap the mic and say it'
            : inTune
              ? `In tune! ${score}%`
              : `Close — ${score}% · try again`}
      </p>
      {label && (
        <p className="mt-1 text-center text-xs text-[#a8a29e]">Heard: “{label}”</p>
      )}
    </div>
  )
}
