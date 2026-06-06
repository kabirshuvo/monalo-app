import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import { getUserAvatarFromSession } from '@/lib/auth/user-avatar'
import ProfilePage from '@/components/profile/ProfilePage'
import ActivityTracker from '@/components/points/ActivityTracker'

export const dynamic = 'force-dynamic'

const DASHBOARD_ROLES = ['CUSTOMER', 'LEARNER', 'WRITER', 'ADMIN', 'SELLER'] as const

export default async function ProfileScreen() {
  const session = await auth()

  if (!session?.user) redirect('/login?callbackUrl=/profile')

  const role = session.user.role
  const layoutRole = DASHBOARD_ROLES.includes(role as (typeof DASHBOARD_ROLES)[number])
    ? (role as 'CUSTOMER' | 'LEARNER' | 'WRITER' | 'ADMIN' | 'SELLER')
    : 'LEARNER'

  return (
    <DashboardLayout
      userRole={layoutRole}
      userName={session.user.name || 'User'}
      userAvatar={getUserAvatarFromSession(session)}
      currentPath="/profile"
    >
      <ActivityTracker type="learning" />
      <div className="max-w-4xl mx-auto">
        <ProfilePage />
      </div>
    </DashboardLayout>
  )
}
