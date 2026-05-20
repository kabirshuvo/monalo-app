"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function ApproveArtworkButton({ slug }: { slug: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const approve = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/gallery/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" onClick={approve} disabled={loading}>
      {loading ? '…' : 'Approve'}
    </Button>
  )
}
