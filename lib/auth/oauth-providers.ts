import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Twitter from 'next-auth/providers/twitter'
import type { Provider } from 'next-auth/providers'
import { authorizeCredentials } from '@/lib/auth/credentials'

function hasGoogleOAuth(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
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

export { hasGoogleOAuth }
