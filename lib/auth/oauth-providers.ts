import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import type { GoogleProfile } from 'next-auth/providers/google'
import type { Provider } from 'next-auth/providers'
import type { EmailConfig } from 'next-auth/providers/email'
import type { User } from 'next-auth'
import { authorizeCredentials } from '@/lib/auth/credentials'
import { sendMagicLinkEmail } from '@/lib/email/resend'

function hasGoogleOAuth(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

/** Passwordless magic-link sign-in is available when Resend is configured. */
function hasMagicLink(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/** Custom Email provider that sends the magic link via Resend's HTTP API (edge-safe). */
function buildMagicLinkProvider(): Provider {
  return {
    id: 'email',
    type: 'email',
    name: 'Email',
    from: process.env.RESEND_FROM_EMAIL || 'MonAlo <onboarding@resend.dev>',
    server: {},
    maxAge: 30 * 60,
    options: {},
    async sendVerificationRequest({ identifier, url }) {
      const result = await sendMagicLinkEmail(identifier, url)
      if (!result.ok) {
        throw new Error(result.error || 'Failed to send sign-in link')
      }
    },
  } as EmailConfig
}

/** Google OAuth (primary) + credentials/email for existing accounts / server flows. */
export function buildAuthProviders(): Provider[] {
  const providers: Provider[] = []

  if (hasGoogleOAuth()) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
        authorization: {
          params: {
            prompt: 'select_account',
          },
        },
        profile(profile: GoogleProfile): User {
          return {
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.picture ?? null,
            emailVerified: profile.email_verified ? new Date() : null,
          } as User
        },
      })
    )
  }

  if (hasMagicLink()) {
    providers.push(buildMagicLinkProvider())
  }

  providers.push(
    Credentials({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeCredentials,
    })
  )

  return providers
}

export { hasGoogleOAuth, hasMagicLink }
