import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a bcrypt hash
 * @param password - Plain text password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if email is valid format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Validate password strength
 * Requires: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
 * @param password - Password to validate
 * @returns Object with valid flag and error message if invalid
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must not exceed 128 characters' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }

  return { valid: true }
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns true if username is valid
 */
export function validateUsername(username: string): boolean {
  // Username: 3-30 chars, alphanumeric and underscores only, no leading/trailing underscore
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  return usernameRegex.test(username) && !username.startsWith('_') && !username.endsWith('_')
}

export interface UserSession {
  id: string
  email: string
  name?: string
  role: string
  emailVerified?: boolean
}

export async function getCurrentUser(req: unknown): Promise<UserSession | null> {
  const headers = (req as { headers?: Record<string, string> })?.headers
  const token = headers?.authorization?.split(' ')[1]
  if (!token) return null
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload as UserSession
  } catch {
    return null
  }
}
