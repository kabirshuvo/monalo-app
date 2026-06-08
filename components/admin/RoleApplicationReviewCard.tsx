'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import { getRoleApplicationOption, type AppliableRole } from '@/lib/auth/role-application-options'
import type { Role, RoleApplicationStatus } from '@prisma/client'

export type AdminRoleApplication = {
  id: string
  requestedRoles: Role[]
  message: string | null
  status: RoleApplicationStatus
  assignedRole: Role | null
  createdAt: string | Date
  user: {
    id: string
    name: string | null
    email: string | null
    role: Role
  }
}

export default function RoleApplicationReviewCard({
  application,
}: {
  application: AdminRoleApplication
}) {
  const router = useRouter()
  const [assignedRole, setAssignedRole] = useState<AppliableRole>(
    (application.requestedRoles.find((r) => r !== 'ADMIN') as AppliableRole) ??
      (application.requestedRoles[0] as AppliableRole)
  )
  const [adminNote, setAdminNote] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const roleOptions = application.requestedRoles.map((role) => {
    const option = getRoleApplicationOption(role as AppliableRole)
    return {
      value: role,
      label: option ? `${option.heading} — ${option.subheading}` : role,
    }
  })

  const review = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(status === 'APPROVED' ? 'approve' : 'reject')
    setError(null)
    try {
      const res = await fetch(`/api/role-applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedRole: status === 'APPROVED' ? assignedRole : undefined,
          adminNote: adminNote || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not update application')
        return
      }
      router.refresh()
    } catch {
      setError('Could not update application')
    } finally {
      setLoading(null)
    }
  }

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">
            {application.user.name ?? 'User'}{' '}
            <span className="font-normal text-gray-500">({application.user.email})</span>
          </p>
          <p className="text-sm text-gray-600">
            Current role: {application.user.role} · submitted{' '}
            {new Date(application.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge variant="warning" size="sm">
          Pending
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {application.requestedRoles.map((role) => {
          const option = getRoleApplicationOption(role as AppliableRole)
          return (
            <span
              key={role}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800"
            >
              {option?.heading ?? role}
            </span>
          )
        })}
      </div>

      {application.message && (
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
          “{application.message}”
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Select
          label="Role to assign if approved"
          options={roleOptions}
          value={assignedRole}
          onChange={(e) => setAssignedRole(e.target.value as AppliableRole)}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Note to applicant (optional)
          </label>
          <textarea
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Optional message when approving or rejecting"
          />
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error" className="mt-3">
          {error}
        </Alert>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <Button
          type="button"
          onClick={() => review('APPROVED')}
          isLoading={loading === 'approve'}
          disabled={loading !== null}
        >
          Approve & assign role
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => review('REJECTED')}
          isLoading={loading === 'reject'}
          disabled={loading !== null}
        >
          Reject
        </Button>
      </div>
    </article>
  )
}
