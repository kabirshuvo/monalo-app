import type { DefaultSession } from 'next-auth'
import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      isFirstLogin?: boolean
      emailVerified?: Date | null
      avatarUrl?: string | null
      level?: number
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: Role
    isFirstLogin?: boolean
    emailVerified?: Date | null
    avatarUrl?: string | null
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    role?: Role
    isFirstLogin?: boolean
    emailVerified?: Date | null
    avatarUrl?: string | null
    level?: number
  }
}

/** Adapter rows may omit role in @auth package types; session callback supplies it from Prisma. */
declare module 'next-auth/adapters' {
  interface AdapterUser {
    role?: Role
    emailVerified?: Date | null
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role?: Role
    emailVerified?: Date | null
  }
}
