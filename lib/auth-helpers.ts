import crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derived) => {
      if (err) reject(err)
      resolve(salt + ':' + derived.toString('hex'))
    })
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':')
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derived) => {
      if (err) reject(err)
      resolve(key === derived.toString('hex'))
    })
  })
}

export interface UserSession {
  id: string
  email: string
  name?: string
  role: string
  emailVerified?: boolean
}

export async function getCurrentUser(req: unknown): Promise<UserSession | null> {
  const token = req?.headers?.authorization?.split(' ')[1]
  if (!token) return null
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload as UserSession
  } catch {
    return null
  }
}
