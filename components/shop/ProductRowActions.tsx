'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

type ProductRowActionsProps = {
  slug: string
  name: string
  canEdit: boolean
}

export default function ProductRowActions({ slug, name, canEdit }: ProductRowActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!canEdit) {
    return (
      <Link href={`/shop/${slug}`} className="text-sm text-blue-600 hover:underline">
        View
      </Link>
    )
  }

  const remove = async () => {
    if (!window.confirm(`Remove “${name}” from the shop?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        window.alert(data.error || 'Could not remove product')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/dashboard/seller/products/${slug}/edit`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        Edit
      </Link>
      <Link href={`/shop/${slug}`} className="text-sm text-gray-600 hover:underline">
        View
      </Link>
      <Button type="button" size="sm" variant="ghost" disabled={loading} onClick={remove}>
        {loading ? '…' : 'Remove'}
      </Button>
    </div>
  )
}
