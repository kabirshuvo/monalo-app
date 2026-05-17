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
