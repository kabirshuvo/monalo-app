import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/** Hash password with bcryptjs (edge-safe, pure JS). */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/** Verify password against bcrypt hash. Compatible with legacy bcrypt native hashes. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' }
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password must not exceed 128 characters' }
  }
  return { valid: true }
}
