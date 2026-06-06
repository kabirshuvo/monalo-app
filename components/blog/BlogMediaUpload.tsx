'use client'

import { useRef, useState } from 'react'
import Button from '@/components/ui/Button'

type BlogMediaUploadProps = {
  label?: string
  value: string
  onChange: (url: string) => void
  disabled?: boolean
  hint?: string
}

export default function BlogMediaUpload({
  label = 'Image',
  value,
  onChange,
  disabled = false,
  hint = 'Upload JPEG, PNG, WebP, or GIF (max 5 MB), or paste an HTTPS image URL.',
}: BlogMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'blog')
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
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
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-zinc-50">{label}</label>
      )}
      <div className="flex flex-wrap gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          disabled={disabled || uploading}
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload(file)
            e.target.value = ''
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || uploading}
          isLoading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          Upload
        </Button>
      </div>
      {hint && <p className="text-xs text-gray-500 dark:text-zinc-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {value && (
        <div className="relative mt-2 aspect-[2/1] max-w-md overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  )
}
