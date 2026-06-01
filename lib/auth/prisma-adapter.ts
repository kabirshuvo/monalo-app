import { PrismaAdapter } from '@auth/prisma-adapter'
import type { PrismaClient } from '@prisma/client'
import type { Adapter, AdapterAccount } from '@auth/core/adapters'

// Columns that actually exist on our Prisma `Account` model. OAuth providers
// (e.g. Google) return extra token fields such as `expires_in` that Auth.js
// spreads straight into the account object. The PrismaAdapter then forwards them
// to `prisma.account.create()`, which throws PrismaClientValidationError for any
// field that isn't a column — breaking first-time OAuth sign-in (linkAccount).
// We whitelist the known columns so only valid fields reach Prisma.
const ACCOUNT_COLUMNS = new Set([
  'userId',
  'type',
  'provider',
  'providerAccountId',
  'refresh_token',
  'access_token',
  'expires_at',
  'token_type',
  'scope',
  'id_token',
  'session_state',
])

function sanitizeAccount(account: AdapterAccount): AdapterAccount {
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(account)) {
    if (ACCOUNT_COLUMNS.has(key)) clean[key] = value
  }
  return clean as AdapterAccount
}

/**
 * PrismaAdapter that strips non-schema fields from account data before writing,
 * so provider token extras (e.g. Google's `expires_in`) don't break linkAccount.
 */
export function MonaloPrismaAdapter(prisma: PrismaClient): Adapter {
  const adapter = PrismaAdapter(prisma)
  return {
    ...adapter,
    linkAccount: (account) => adapter.linkAccount!(sanitizeAccount(account)),
  }
}
