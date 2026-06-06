import { cookies } from 'next/headers'
import { getToken } from 'next-auth/jwt'
import type { JWT } from '@auth/core/jwt'

const secret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-change-in-production')

/** Read the raw Auth.js JWT from the session cookie (App Router). */
export async function getAuthJwtFromCookies(): Promise<JWT | null> {
  if (!secret) return null

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  if (!cookieHeader) return null

  return getToken({
    req: { headers: { cookie: cookieHeader } },
    secret,
    secureCookie: process.env.NODE_ENV === 'production',
  })
}
