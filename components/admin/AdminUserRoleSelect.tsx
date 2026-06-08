'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'
import { ADMIN_ASSIGNABLE_ROLES } from '@/lib/auth/role-application-options'
import { ROLE_DESCRIPTIONS } from '@/lib/auth/roles'
import type { Role } from '@prisma/client'

type AdminUserRoleSelectProps = {
  userId: string
  currentRole: Role
  disabled?: boolean
}

export default function AdminUserRoleSelect({
  userId,
  currentRole,
  disabled,
}: AdminUserRoleSelectProps) {
  const router = useRouter()
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const options = ADMIN_ASSIGNABLE_ROLES.map((value) => ({
    value,
    label: `${value} — ${ROLE_DESCRIPTIONS[value].split(' - ')[1] ?? ROLE_DESCRIPTIONS[value]}`,
  }))

  const save = async (nextRole: Role) => {
    if (nextRole === role) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not update role')
        setRole(currentRole)
        return
      }
      setRole(nextRole)
      router.refresh()
    } catch {
      setError('Could not update role')
      setRole(currentRole)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-w-[12rem]">
      <Select
        label=""
        options={options}
        value={role}
        disabled={disabled || loading}
        onChange={(e) => save(e.target.value as Role)}
        aria-label="Change user role"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
