"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import LoadingState from '@/components/ui/LoadingState'
import api from '@/lib/api'

interface UserProfile {
  id: string
  name?: string | null
  email?: string | null
  avatar?: string | null
  phone?: string | null
  role: string
  level?: number
  badge?: string
  points?: number
  isVerified?: boolean
  createdAt?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: ''
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get<{ ok: boolean; profile: UserProfile }>('/api/profile')
        if (res?.profile) {
          setProfile(res.profile)
          setFormData({
            name: res.profile.name || '',
            phone: res.profile.phone || '',
            avatar: res.profile.avatar || ''
          })
        }
      } catch (error) {
        setErrorMessage('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const res = await api.patch<{ ok: boolean; profile: UserProfile }>('/api/profile', {
        name: formData.name || null,
        phone: formData.phone || null,
        avatar: formData.avatar || null
      })

      if (res?.ok && res.profile) {
        setProfile(res.profile)
        setSuccessMessage('Your profile has been updated.')
      } else {
        setErrorMessage('Could not save your changes. Please try again.')
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingState variant="global" />
  }

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <p className="text-gray-600 text-center py-8">Profile not found.</p>
          <div className="text-center">
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
              Back to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRoleVariant = (role: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (role) {
      case 'ADMIN': return 'danger'
      case 'WRITER': return 'warning'
      case 'LEARNER': return 'info'
      case 'CUSTOMER': return 'success'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      {successMessage && (
        <Alert variant="success" title="Saved">
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" title="Error">
          {errorMessage}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>Account Details</CardTitle>
            <Badge variant={getRoleVariant(profile.role)}>
              {profile.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-gray-500 text-xs">(read-only)</span>
                </label>
                <Input
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <Input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {profile.level !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Level</div>
                <div className="text-2xl font-bold text-gray-900">{profile.level}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Points</div>
                <div className="text-2xl font-bold text-gray-900">{profile.points || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Badge</div>
                <div className="text-sm font-medium text-gray-700 mt-2">{profile.badge || 'None'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 text-sm">
            <div>
              <dt className="text-gray-600">Account ID</dt>
              <dd className="font-mono text-gray-900 mt-1">{profile.id}</dd>
            </div>
            {profile.createdAt && (
              <div>
                <dt className="text-gray-600">Member since</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </dd>
              </div>
            )}
            {profile.isVerified !== undefined && (
              <div>
                <dt className="text-gray-600">Verification status</dt>
                <dd className="mt-1">
                  <Badge variant={profile.isVerified ? 'success' : 'warning'}>
                    {profile.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
