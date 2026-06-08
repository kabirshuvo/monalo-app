'use client'

import { useEffect, useState } from 'react'
import Modal, { ModalFooter } from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import {
  APPLIABLE_ROLES,
  ROLE_APPLICATION_OPTIONS,
  type AppliableRole,
} from '@/lib/auth/role-application-options'
import api, { ApiError } from '@/lib/api'

type RoleApplication = {
  id: string
  requestedRoles: AppliableRole[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  assignedRole?: AppliableRole | null
  createdAt: string
}

type RoleApplicationModalProps = {
  isOpen: boolean
  onClose: () => void
  currentRole: string
  onSubmitted?: () => void
}

export default function RoleApplicationModal({
  isOpen,
  onClose,
  currentRole,
  onSubmitted,
}: RoleApplicationModalProps) {
  const [selected, setSelected] = useState<AppliableRole[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setSelected([])
      setMessage('')
      setError(null)
      setSuccess(null)
    }
  }, [isOpen])

  const toggleRole = (role: AppliableRole) => {
    setSelected((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const submit = async () => {
    if (selected.length === 0) {
      setError('Choose at least one role that fits how you want to contribute.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.post('/api/role-applications', {
        roles: selected,
        message: message || undefined,
      })
      setSuccess('Application sent! An admin will review your request soon.')
      onSubmitted?.()
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || 'Could not submit your application.'
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const selectableOptions = ROLE_APPLICATION_OPTIONS.filter(
    (option) => option.role !== currentRole
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for a role"
      size="lg"
    >
      <div className="space-y-5">
        <p className="text-sm text-gray-600">
          Tell us how you&apos;d like to grow with MonAlo. You can select more than one path — we
          will review your application and assign the best fit.
        </p>

        {currentRole && currentRole !== 'BROWSER' && (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Your current role: <strong>{currentRole}</strong>
          </p>
        )}

        <div className="space-y-3">
          {selectableOptions.map((option) => {
            const checked = selected.includes(option.role)
            return (
              <label
                key={option.role}
                className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors ${
                  checked
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={checked}
                  onChange={() => toggleRole(option.role)}
                />
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-gray-900">{option.heading}</span>
                  <span className="block text-sm font-medium text-blue-700">{option.subheading}</span>
                  <span className="mt-1 block text-sm text-gray-600">{option.description}</span>
                </span>
              </label>
            )
          })}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Why do you want these roles? <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share a little about your experience or how you hope to help MonAlo..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <Alert variant="danger" title="Could not submit">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" title="Submitted">
            {success}
          </Alert>
        )}
      </div>

      <ModalFooter>
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="button" onClick={submit} isLoading={loading}>
          Submit application
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export function RoleApplicationStatusCard({
  applications,
  onApply,
}: {
  applications: RoleApplication[]
  onApply: () => void
}) {
  const pending = applications.find((a) => a.status === 'PENDING')
  const latestApproved = applications.find((a) => a.status === 'APPROVED')

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
      <h3 className="text-lg font-semibold text-gray-900">Grow your role on MonAlo</h3>
      <p className="mt-1 text-sm text-gray-600">
        Apply to become a guardian, sponsor, donor, seller, or writer and unlock new ways to
        contribute.
      </p>

      {pending ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Application under review</p>
          <p className="mt-1">
            Requested: {pending.requestedRoles.join(', ')} · submitted{' '}
            {new Date(pending.createdAt).toLocaleDateString()}
          </p>
        </div>
      ) : latestApproved ? (
        <p className="mt-4 text-sm text-green-800">
          Last approved role: <strong>{latestApproved.assignedRole ?? '—'}</strong>
        </p>
      ) : null}

      <div className="mt-4">
        <Button type="button" onClick={onApply} disabled={Boolean(pending)}>
          {pending ? 'Application pending' : 'Apply for a role'}
        </Button>
      </div>
    </div>
  )
}

export type { RoleApplication }
