'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Alert from '@/components/ui/Alert'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/shop/labels'
import type { OrderStatus, PaymentStatus } from '@prisma/client'

type UpdateOrderFormProps = {
  orderId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  trackingNumber: string | null
}

export default function UpdateOrderForm({
  orderId,
  status,
  paymentStatus,
  trackingNumber,
}: UpdateOrderFormProps) {
  const router = useRouter()
  const [nextStatus, setNextStatus] = useState(status)
  const [nextPayment, setNextPayment] = useState(paymentStatus)
  const [tracking, setTracking] = useState(trackingNumber ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          paymentStatus: nextPayment,
          trackingNumber: tracking.trim() || null,
          shippingStatus: nextStatus === 'SHIPPED' ? 'shipped' : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Update failed')
        return
      }
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {error && <Alert variant="danger">{error}</Alert>}
      <Select
        label="Order status"
        value={nextStatus}
        onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
        options={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <Select
        label="Payment"
        value={nextPayment}
        onChange={(e) => setNextPayment(e.target.value as PaymentStatus)}
        options={Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <Input
        label="Tracking #"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        placeholder="Optional"
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Saving…' : 'Update'}
      </Button>
    </form>
  )
}
