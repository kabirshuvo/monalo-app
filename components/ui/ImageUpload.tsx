"use client"

import { useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'

type Props = {
  label?: string
  folder: 'gallery' | 'shop' | 'products'
  value: string
  onChange: (url: string) => void
  hint?: string
}

export default function ImageUpload({
  label = 'Image',
  folder,
  value,
  onChange,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', folder)

      const res = await fetch('/api/uploads', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }
      onChange(data.url)
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {error && <Alert variant="danger">{error}</Alert>}

      {value ? (
        <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Upload preview" className="w-full h-40 object-cover" />
          <button
            type="button"
            className="absolute top-2 right-2 text-xs bg-white/90 px-2 py-1 rounded shadow"
            onClick={() => onChange('')}
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <p className="text-sm text-gray-600">Click to upload (max 5 MB)</p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, or GIF</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) upload(file)
          e.target.value = ''
        }}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Uploading…' : value ? 'Replace image' : 'Choose file'}
        </Button>
      </div>

      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
