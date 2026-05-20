"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'

type Props = {
  slug: string
  title: string
}

export default function ArtworkPurchaseClient({ slug, title }: Props) {
  const router = useRouter()
  const [shippingAddress, setShippingAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const purchase = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/gallery/${slug}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: shippingAddress.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (res.status === 401) {
        router.push(`/login?callbackUrl=/gallery/${slug}`)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Could not complete purchase')
        return
      }

      setSuccess(`Thank you — your order for “${title}” is reserved. We will follow up about payment and delivery.`)
      setTimeout(() => {
        router.push('/dashboard/customer/orders')
      }, 2500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 border-t border-gray-200 pt-6">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Input
        label="Shipping address (optional)"
        value={shippingAddress}
        onChange={(e) => setShippingAddress(e.target.value)}
        placeholder="Where should we send this piece?"
      />
      <Button onClick={purchase} disabled={loading} fullWidth>
        {loading ? 'Processing…' : 'Purchase artwork'}
      </Button>
      <p className="text-xs text-gray-500">
        Payment integration (Stripe) coming next. Your order is recorded as pending.
      </p>
    </div>
  )
}
