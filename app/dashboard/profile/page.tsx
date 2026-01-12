import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import ProfilePage from '@/components/profile/ProfilePage'

export const metadata = {
  title: 'Profile - MonAlo',
}

export default async function ProfileRoute() {
  const session = await auth()

  if (!session || !session.user) redirect('/login')

  const role = (session.user as any)?.role || 'CUSTOMER'

  return (
    <DashboardLayout
      userRole={role}
      userName={session.user.name || 'User'}
      userAvatar={session.user.image || undefined}
      currentPath="/dashboard/profile"
    >
      <div className="max-w-4xl mx-auto">
        <ProfilePage />
      </div>
    </DashboardLayout>
  )
}
