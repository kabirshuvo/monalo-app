import type { DefaultSession } from 'next-auth'
import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      isFirstLogin?: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: Role
    isFirstLogin?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: Role
    isFirstLogin?: boolean
  }
}

/** Adapter rows may omit role in @auth package types; session callback supplies it from Prisma. */
declare module 'next-auth/adapters' {
  interface AdapterUser {
    role?: Role
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role?: Role
  }
}
