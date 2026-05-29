'use client'

import { useState } from 'react'
import {
  AVATAR_PRESET_PREFIX,
  encodePresetAvatar,
  getPresetFromAvatarValue,
  MOOD_PRESETS,
  PERSONALITY_PRESETS,
  type AvatarPreset,
} from '@/lib/avatars/presets'
import AvatarVisual from '@/components/profile/AvatarVisual'

type Tab = 'mood' | 'personality' | 'custom'

type AvatarPickerProps = {
  value: string
  onChange: (value: string) => void
  displayName?: string | null
}

export default function AvatarPicker({ value, onChange, displayName }: AvatarPickerProps) {
  const initialTab: Tab = getPresetFromAvatarValue(value)
    ? getPresetFromAvatarValue(value)!.category
  : value?.startsWith('http')
      ? 'custom'
      : 'mood'

  const [tab, setTab] = useState<Tab>(initialTab)
  const [customUrl, setCustomUrl] = useState(
    value && !value.startsWith(AVATAR_PRESET_PREFIX) ? value : ''
  )

  const selectedPreset = getPresetFromAvatarValue(value)

  const selectPreset = (preset: AvatarPreset) => {
    onChange(encodePresetAvatar(preset.id))
    setTab(preset.category)
  }

  const presets = tab === 'mood' ? MOOD_PRESETS : tab === 'personality' ? PERSONALITY_PRESETS : []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <AvatarVisual value={value} name={displayName} size="lg" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {selectedPreset ? selectedPreset.name : 'Your avatar'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {selectedPreset
              ? selectedPreset.tagline
              : value?.startsWith('http')
                ? 'Custom image'
                : 'Choose a mood or personality below'}
          </p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {(
          [
            ['mood', 'Mood'],
            ['personality', 'Personality'],
            ['custom', 'Custom URL'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'custom' ? (
        <div className="space-y-2">
          <label className="block text-sm text-gray-600">
            Paste an image link (optional). Preset avatars are recommended for a consistent look.
          </label>
          <input
            type="url"
            value={customUrl}
            onChange={(e) => {
              setCustomUrl(e.target.value)
              onChange(e.target.value)
            }}
            placeholder="https://example.com/your-photo.jpg"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            {tab === 'mood'
              ? 'Pick an avatar that matches how you feel today.'
              : 'Pick an avatar that reflects your learning style on MonAlo.'}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {presets.map((preset) => {
              const presetValue = encodePresetAvatar(preset.id)
              const isSelected = value === presetValue
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  }`}
                  title={preset.tagline}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${preset.gradient} flex items-center justify-center text-2xl`}
                  >
                    {preset.emoji}
                  </div>
                  <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                    {preset.name}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
