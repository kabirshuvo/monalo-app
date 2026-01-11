import NextAuth from 'next-auth'
import authConfig from '@/auth.config'

/**
 * NextAuth API route handler for [...nextauth] dynamic route
 * 
 * This route handles all NextAuth operations:
 * - Sign-in with credentials (email/password)
 * - Session management
 * - Token refresh
 * - Sign-out
 * - Callback routes for OAuth providers
 * 
 * Features:
 * - Credentials provider with email/password authentication
 * - bcrypt password hashing and verification
 * - Database-backed sessions via PrismaAdapter
 * - Automatic lastLoginAt timestamp updates on sign-in
 * - User ID and role injection into session/JWT
 * - Secure secret from environment variable
 * 
 * Environment Variables Required:
 * - NEXTAUTH_SECRET: Encryption secret for sessions/JWT
 *   Generate with: openssl rand -base64 32
 * - DATABASE_URL: PostgreSQL connection string
 * - DIRECT_URL: Direct database connection (for migrations)
 * 
 * NextAuth Configuration:
 * - Adapter: PrismaAdapter (database-backed sessions)
 * - Session Strategy: Database (stored in DB, more secure)
 * - Session Max Age: 30 days
 * - Session Update Age: 24 hours
 * - Pages:
 *   - Sign In: /(auth)/login
 *   - New User: /(auth)/register
 * 
 * Callbacks:
 * - signIn: Updates lastLoginAt on successful authentication
 * - session: Injects user id and role into session
 * - jwt: Preserves user id and role in JWT token
 */

// Validate that NEXTAUTH_SECRET is set
const secret = process.env.NEXTAUTH_SECRET
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error(
    'NEXTAUTH_SECRET environment variable is not set. ' +
    'This is required in production. ' +
    'Generate one with: openssl rand -base64 32'
  )
}

// Create the NextAuth handler with our configuration
const handler = NextAuth({
  ...authConfig,
  secret: secret || 'dev-secret-change-in-production', // Use env var in production
})

// Export as both GET and POST handlers for NextAuth API route
export { handler as GET, handler as POST }

