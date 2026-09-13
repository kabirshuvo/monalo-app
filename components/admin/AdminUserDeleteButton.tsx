'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

type AdminUserDeleteButtonProps = {
  userId: string
  email: string | null
  disabled?: boolean
}

export default function AdminUserDeleteButton({
  userId,
  email,
  disabled,
}: AdminUserDeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = async () => {
    const label = email ?? 'this user'
    if (!window.confirm(`Delete ${label}? This permanently removes their account and cannot be undone.`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not delete user')
        return
      }
      router.refresh()
    } catch {
      setError('Could not delete user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={disabled || loading}
        onClick={remove}
        className="text-red-700 border-red-200 hover:bg-red-50"
      >
        {loading ? 'Deleting…' : 'Delete'}
      </Button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
