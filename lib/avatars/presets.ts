export const AVATAR_PRESET_PREFIX = 'monalo:'

export type AvatarCategory = 'mood' | 'personality'

export type AvatarPreset = {
  id: string
  name: string
  tagline: string
  category: AvatarCategory
  emoji: string
  /** Tailwind gradient classes for the avatar circle */
  gradient: string
  ring: string
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  // Mood — how you feel today
  {
    id: 'mood-calm',
    name: 'Calm',
    tagline: 'Peaceful and steady',
    category: 'mood',
    emoji: '🧘',
    gradient: 'from-teal-400 to-cyan-600',
    ring: 'ring-teal-200',
  },
  {
    id: 'mood-energetic',
    name: 'Energetic',
    tagline: 'Ready to take on the day',
    category: 'mood',
    emoji: '⚡',
    gradient: 'from-amber-400 to-orange-500',
    ring: 'ring-amber-200',
  },
  {
    id: 'mood-focused',
    name: 'Focused',
    tagline: 'Deep work mode',
    category: 'mood',
    emoji: '🎯',
    gradient: 'from-indigo-500 to-slate-700',
    ring: 'ring-indigo-200',
  },
  {
    id: 'mood-joyful',
    name: 'Joyful',
    tagline: 'Bright and curious',
    category: 'mood',
    emoji: '✨',
    gradient: 'from-pink-400 to-rose-500',
    ring: 'ring-pink-200',
  },
  {
    id: 'mood-reflective',
    name: 'Reflective',
    tagline: 'Thoughtful and quiet',
    category: 'mood',
    emoji: '🌙',
    gradient: 'from-violet-500 to-purple-800',
    ring: 'ring-violet-200',
  },
  {
    id: 'mood-grateful',
    name: 'Grateful',
    tagline: 'Warm and thankful',
    category: 'mood',
    emoji: '💛',
    gradient: 'from-yellow-300 to-amber-500',
    ring: 'ring-yellow-200',
  },
  // Personality — who you are on MonAlo
  {
    id: 'personality-explorer',
    name: 'Explorer',
    tagline: 'Always discovering',
    category: 'personality',
    emoji: '🔭',
    gradient: 'from-emerald-400 to-green-700',
    ring: 'ring-emerald-200',
  },
  {
    id: 'personality-scholar',
    name: 'Scholar',
    tagline: 'Loves to learn',
    category: 'personality',
    emoji: '📚',
    gradient: 'from-blue-500 to-blue-800',
    ring: 'ring-blue-200',
  },
  {
    id: 'personality-creator',
    name: 'Creator',
    tagline: 'Makes and shares',
    category: 'personality',
    emoji: '🎨',
    gradient: 'from-fuchsia-400 to-purple-600',
    ring: 'ring-fuchsia-200',
  },
  {
    id: 'personality-helper',
    name: 'Helper',
    tagline: 'Supports others',
    category: 'personality',
    emoji: '🤝',
    gradient: 'from-lime-400 to-teal-600',
    ring: 'ring-lime-200',
  },
  {
    id: 'personality-leader',
    name: 'Leader',
    tagline: 'Inspires the room',
    category: 'personality',
    emoji: '🌟',
    gradient: 'from-amber-300 to-yellow-600',
    ring: 'ring-amber-200',
  },
  {
    id: 'personality-dreamer',
    name: 'Dreamer',
    tagline: 'Imagines what’s next',
    category: 'personality',
    emoji: '☁️',
    gradient: 'from-sky-300 to-indigo-500',
    ring: 'ring-sky-200',
  },
]

const presetById = new Map(AVATAR_PRESETS.map((p) => [p.id, p]))

export function encodePresetAvatar(presetId: string): string {
  return `${AVATAR_PRESET_PREFIX}${presetId}`
}

export function getPresetFromAvatarValue(value: string | null | undefined): AvatarPreset | null {
  if (!value?.startsWith(AVATAR_PRESET_PREFIX)) return null
  const id = value.slice(AVATAR_PRESET_PREFIX.length)
  return presetById.get(id) ?? null
}

export function isExternalAvatarUrl(value: string | null | undefined): boolean {
  if (!value) return false
  return value.startsWith('http://') || value.startsWith('https://')
}

export function isValidAvatarValue(value: string | null | undefined): boolean {
  if (!value) return true
  if (isExternalAvatarUrl(value)) {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }
  return getPresetFromAvatarValue(value) !== null
}

export function normalizeAvatarValue(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null
  const trimmed = value.trim()
  if (trimmed.startsWith(AVATAR_PRESET_PREFIX)) {
    return getPresetFromAvatarValue(trimmed) ? trimmed : null
  }
  if (presetById.has(trimmed)) {
    return encodePresetAvatar(trimmed)
  }
  if (isExternalAvatarUrl(trimmed)) return trimmed
  return null
}

export const MOOD_PRESETS = AVATAR_PRESETS.filter((p) => p.category === 'mood')
export const PERSONALITY_PRESETS = AVATAR_PRESETS.filter((p) => p.category === 'personality')
