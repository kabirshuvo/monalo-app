'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import LoadingState from '@/components/ui/LoadingState'
import { POINTS_CONFIG } from '@/lib/points/config'
import api from '@/lib/api'
import { useSession } from 'next-auth/react'
import AvatarPicker from '@/components/profile/AvatarPicker'
import AvatarVisual from '@/components/profile/AvatarVisual'

type PointsBreakdown = {
  totalPoints: number
  level: number
  badge: string
  learning: { minutes: number; points: number }
  reading: { minutes: number; points: number }
  purchases: { taka: number; points: number }
  lessons: { completed: number; points: number }
}

type PointActivity = {
  id: string
  category: string
  points: number
  description: string | null
  createdAt: string
}

interface UserProfile {
  id: string
  name?: string | null
  email?: string | null
  avatar?: string | null
  phone?: string | null
  role: string
  bio?: string | null
  level?: number
  badge?: string
  points?: number
  isVerified?: boolean
  createdAt?: string
  pointsBreakdown?: PointsBreakdown
  recentActivity?: PointActivity[]
}

function categoryLabel(category: string): string {
  switch (category) {
    case 'PURCHASE':
      return 'Purchase'
    case 'BLOG_READING':
      return 'Reading'
    case 'LESSON_COMPLETE':
      return 'Lesson'
    case 'LEARNING':
      return 'Learning'
    default:
      return category
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    avatar: '',
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
            bio: res.profile.bio || '',
            avatar: res.profile.avatar || '',
          })
        }
      } catch {
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
        bio: formData.bio || null,
        avatar: formData.avatar || null,
      })

      if (res?.ok && res.profile) {
        setProfile((prev) => (prev ? { ...prev, ...res.profile } : res.profile))
        setFormData((prev) => ({
          ...prev,
          avatar: res.profile.avatar || '',
        }))
        await updateSession()
        setSuccessMessage('Your smart profile has been updated.')
      } else {
        setErrorMessage('Could not save your changes. Please try again.')
      }
    } catch {
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

  const breakdown = profile.pointsBreakdown
  const totalPoints = breakdown?.totalPoints ?? profile.points ?? 0

  const getRoleVariant = (role: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (role) {
      case 'ADMIN':
        return 'danger'
      case 'WRITER':
        return 'warning'
      case 'LEARNER':
        return 'info'
      case 'CUSTOMER':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-8">
      {/* Smart profile hero */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <AvatarVisual
            value={formData.avatar || profile.avatar}
            name={formData.name || profile.name}
            size="lg"
            className="ring-4 ring-white/30"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold truncate">{profile.name || 'MonAlo learner'}</h1>
              <Badge variant={getRoleVariant(profile.role)}>{profile.role}</Badge>
            </div>
            {profile.bio && <p className="text-blue-100 text-sm mb-3 line-clamp-2">{profile.bio}</p>}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-white/15 rounded-lg px-3 py-1">
                Level <strong>{profile.level ?? 1}</strong>
              </span>
              <span className="bg-white/15 rounded-lg px-3 py-1">
                <strong>{totalPoints}</strong> total points
              </span>
              <span className="bg-white/15 rounded-lg px-3 py-1">
                {profile.badge || 'New Light'}
              </span>
            </div>
          </div>
        </div>
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

      {/* Points breakdown */}
      {breakdown && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Your points</h2>
          <p className="text-sm text-gray-600 mb-4">
            Earn as you learn, read, and shop on MonAlo. ৳{POINTS_CONFIG.takaPerPoint} = 1 pt ·{' '}
            {POINTS_CONFIG.blogMinutesPerPoint} min reading = 1 pt · 1 min learning = 1 pt ·{' '}
            {POINTS_CONFIG.lessonCompleteMin}–{POINTS_CONFIG.lessonCompleteMax} pts per lesson
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-indigo-600">Learning</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {breakdown.learning.minutes} min → {breakdown.learning.points} pts
                </p>
                <p className="text-xs text-gray-500 mt-1">1 point per minute of lessons & courses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-emerald-600">Reading</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {breakdown.reading.minutes} min → {breakdown.reading.points} pts
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  1 point every {POINTS_CONFIG.blogMinutesPerPoint} minutes on the blog
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-amber-600">Purchases</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ৳{breakdown.purchases.taka.toLocaleString()} → {breakdown.purchases.points} pts
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  1 point per ৳{POINTS_CONFIG.takaPerPoint} spent in the shop
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-violet-600">Lessons completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {breakdown.lessons.completed} lessons → {breakdown.lessons.points} pts
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {POINTS_CONFIG.lessonCompleteMin}–{POINTS_CONFIG.lessonCompleteMax} points each
                  time you finish a lesson
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Recent activity */}
      {profile.recentActivity && profile.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {profile.recentActivity.map((item) => (
                <li key={item.id} className="py-3 flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.description || categoryLabel(item.category)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {categoryLabel(item.category)} ·{' '}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 shrink-0">
                    +{item.points}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Edit profile */}
      <Card>
        <CardHeader>
          <CardTitle>Edit smart profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display name</label>
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+880 ..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose your avatar
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Express your mood or personality — your avatar appears across MonAlo.
              </p>
              <AvatarPicker
                value={formData.avatar}
                onChange={(avatar) => setFormData({ ...formData, avatar })}
                displayName={formData.name || profile.name}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell the MonAlo community a little about yourself..."
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button type="button" variant="ghost" onClick={() => router.push('/dashboard')}>
                Back
              </Button>
              <Button type="submit" isLoading={saving}>
                Save profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
