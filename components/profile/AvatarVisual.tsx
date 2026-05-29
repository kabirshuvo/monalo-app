'use client'

import { getPresetFromAvatarValue, isExternalAvatarUrl } from '@/lib/avatars/presets'

type AvatarVisualProps = {
  value: string | null | undefined
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: { box: 'w-10 h-10 text-lg', emoji: 'text-xl' },
  md: { box: 'w-16 h-16 text-2xl', emoji: 'text-3xl' },
  lg: { box: 'w-20 h-20 text-3xl', emoji: 'text-4xl' },
  xl: { box: 'w-24 h-24 text-4xl', emoji: 'text-5xl' },
}

export default function AvatarVisual({
  value,
  name,
  size = 'md',
  className = '',
}: AvatarVisualProps) {
  const sizes = sizeClasses[size]
  const preset = getPresetFromAvatarValue(value)
  const initial = (name || '?').charAt(0).toUpperCase()

  if (preset) {
    return (
      <div
        className={`${sizes.box} rounded-full bg-gradient-to-br ${preset.gradient} flex items-center justify-center shrink-0 ring-2 ${preset.ring} ${className}`}
        title={preset.name}
        aria-hidden
      >
        <span className={sizes.emoji} role="img" aria-label={preset.name}>
          {preset.emoji}
        </span>
      </div>
    )
  }

  if (value && isExternalAvatarUrl(value)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={value}
        alt=""
        className={`${sizes.box} rounded-full object-cover shrink-0 ring-2 ring-white/30 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizes.box} rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shrink-0 font-semibold text-white ring-2 ring-gray-200 ${className}`}
    >
      {initial}
    </div>
  )
}
