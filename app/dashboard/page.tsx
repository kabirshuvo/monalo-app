import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard - MonAlo',
  description: 'Your personalized learning and selling dashboard',
}

export default async function DashboardPage() {
  // Server-side auth check
  const session = await auth()

  // Redirect to login if not authenticated
  if (!session || !session.user) {
    redirect('/login')
  }

  // Get user role and redirect to role-specific dashboard
  const role = session.user.role || 'CUSTOMER'

  const roleRoutes: Record<string, string> = {
    ADMIN: '/dashboard/admin',
    WRITER: '/dashboard/writer',
    LEARNER: '/dashboard/learning',
    CUSTOMER: '/dashboard/customer',
  }

  const destinationRoute = roleRoutes[role] || '/dashboard/customer'
  redirect(destinationRoute)
}
