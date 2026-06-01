import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import type { GoogleProfile } from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Twitter from 'next-auth/providers/twitter'
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

/** Only register OAuth providers that have credentials configured. */
export function buildAuthProviders(): Provider[] {
  const providers: Provider[] = []

  if (hasGoogleOAuth()) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        // Link Google to an existing account with the same verified email (e.g. registered with password).
        allowDangerousEmailAccountLinking: true,
        // Map Google's profile to our schema. The default mapping emits an `image`
        // field, but our User model uses `avatarUrl` and has no `image` column —
        // passing `image` makes the PrismaAdapter's createUser() throw a validation
        // error for every brand-new Google user (breaking first-time Google sign-in).
        profile(profile: GoogleProfile): User {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.picture ?? null,
            emailVerified: profile.email_verified ? new Date() : null,
          } as User
        },
      })
    )
  }

  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    providers.push(
      Facebook({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      })
    )
  }

  if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
    providers.push(
      Twitter({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
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
