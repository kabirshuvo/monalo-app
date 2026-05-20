"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Alert from '@/components/ui/Alert'

export default function SellerArtworkForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceDollars, setPriceDollars] = useState('')
  const [medium, setMedium] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [year, setYear] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (submitForReview: boolean) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const price = Math.round(parseFloat(priceDollars) * 100)
    if (!title.trim() || !Number.isFinite(price) || price < 0) {
      setError('Enter a title and valid price.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          price,
          medium: medium.trim() || undefined,
          dimensions: dimensions.trim() || undefined,
          year: year ? parseInt(year, 10) : undefined,
          imageUrl: imageUrl.trim() || undefined,
          submitForReview,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save artwork')
        return
      }
      setSuccess(
        submitForReview
          ? `“${data.title}” submitted for review.`
          : `“${data.title}” saved as draft.`
      )
      setTitle('')
      setDescription('')
      setPriceDollars('')
      setMedium('')
      setDimensions('')
      setYear('')
      setImageUrl('')
      router.refresh()
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(true)
      }}
      className="rounded-xl border border-gray-200 p-6 space-y-4 bg-white max-w-xl"
    >
      <h2 className="text-lg font-semibold text-gray-900">Add artwork</h2>
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (USD)"
          type="number"
          step="0.01"
          min="0"
          value={priceDollars}
          onChange={(e) => setPriceDollars(e.target.value)}
          required
        />
        <Input
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>
      <Input label="Medium" value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="Oil on canvas" />
      <Input label="Dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="24 × 36 in" />
      <Input
        label="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://..."
      />

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" disabled={loading} onClick={() => submit(false)}>
          Save draft
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Submit for review'}
        </Button>
      </div>
    </form>
  )
}
