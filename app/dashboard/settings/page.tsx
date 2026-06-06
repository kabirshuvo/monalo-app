import { redirect } from 'next/navigation'

/** Alias — canonical settings URL is /settings */
export default function DashboardSettingsRedirect() {
  redirect('/settings')
}
