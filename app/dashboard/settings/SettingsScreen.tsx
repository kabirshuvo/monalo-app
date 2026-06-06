import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import { getUserAvatarFromSession } from '@/lib/auth/user-avatar'
import SettingsPage from '@/components/settings/SettingsPage'

export const dynamic = 'force-dynamic'

const DASHBOARD_ROLES = ['CUSTOMER', 'LEARNER', 'WRITER', 'ADMIN', 'SELLER'] as const

export default async function SettingsScreen() {
  const session = await auth()

  if (!session?.user) redirect('/login?callbackUrl=/settings')

  const role = session.user.role
  const layoutRole = DASHBOARD_ROLES.includes(role as (typeof DASHBOARD_ROLES)[number])
    ? (role as 'CUSTOMER' | 'LEARNER' | 'WRITER' | 'ADMIN' | 'SELLER')
    : 'LEARNER'

  return (
    <DashboardLayout
      userRole={layoutRole}
      userName={session.user.name || 'User'}
      userAvatar={getUserAvatarFromSession(session)}
      currentPath="/settings"
    >
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
        <SettingsPage userEmail={session.user.email} userName={session.user.name} />
      </div>
    </DashboardLayout>
  )
}
