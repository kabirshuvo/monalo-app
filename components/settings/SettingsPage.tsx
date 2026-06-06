'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { clientSignOut } from '@/lib/auth/client-sign-out'
import { Card, CardContent, CardHeader, CardTitle, Alert } from '@/components/ui'
import Button from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui'
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '@/lib/settings/preferences'
import { logEvent } from '@/lib/analytics'

type SettingsPageProps = {
  userEmail?: string | null
  userName?: string | null
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start justify-between gap-4 py-3 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">{label}</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-purple-500' : 'bg-gray-300 dark:bg-zinc-700',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
            checked ? 'translate-x-5' : 'translate-x-0.5',
            'mt-0.5',
          ].join(' ')}
        />
      </button>
    </label>
  )
}

export default function SettingsPage({ userEmail, userName }: SettingsPageProps) {
  const { data: session } = useSession()
  const email = userEmail || session?.user?.email || ''
  const name = userName || session?.user?.name || 'MonAlo member'

  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setPrefs(loadPreferences())
  }, [])

  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    savePreferences(next)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const handleSignOut = async () => {
    try {
      logEvent('logout', { method: 'settings_signout' })
    } catch {}
    clientSignOut()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-50">Settings</h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          Manage your account, appearance, and notifications for {name}.
        </p>
      </div>

      {saved && (
        <Alert variant="success" title="Saved">
          Your preferences were updated on this device.
        </Alert>
      )}

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">Theme</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                System, light, or dark — applies across MonAlo.
              </p>
            </div>
            <ThemeToggle />
          </div>
          <ToggleRow
            label="Compact navigation"
            description="Use a denser sidebar on dashboard pages (this device only)."
            checked={prefs.compactNav}
            onChange={(v) => updatePref('compactNav', v)}
          />
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">{email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/profile">
              <Button variant="secondary" size="sm">
                Edit profile
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100 dark:divide-zinc-800">
          <ToggleRow
            label="Learning reminders"
            description="Gentle nudges to continue courses you started."
            checked={prefs.learningReminders}
            onChange={(v) => updatePref('learningReminders', v)}
          />
          <ToggleRow
            label="Points milestones"
            description="Celebrate when you level up or earn badges."
            checked={prefs.pointsMilestones}
            onChange={(v) => updatePref('pointsMilestones', v)}
          />
          <ToggleRow
            label="Shop & gallery updates"
            description="New products, artworks, and MonAlo announcements."
            checked={prefs.productUpdates}
            onChange={(v) => updatePref('productUpdates', v)}
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400 pt-2">
            Email delivery for these options is coming soon. Your choices are saved on this device.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-zinc-300">
            Use a magic link or Google to sign in. You can request a password reset if you also use
            email credentials.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/forgot-password">
              <Button variant="secondary" size="sm">
                Reset password
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle>Help & privacy</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/contact">
            <Button variant="ghost" size="sm">
              Contact support
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm">
              About MonAlo
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
