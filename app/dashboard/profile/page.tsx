import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Profile - MonAlo',
}

/** Alias — canonical profile URL is /profile */
export default function DashboardProfileRedirect() {
  redirect('/profile')
}
