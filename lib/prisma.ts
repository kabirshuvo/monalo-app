// lib/prisma.ts — re-exports the shared Prisma singleton from lib/db.ts.
// Use this import in server-side code and scripts:
//   import { prisma } from '@/lib/prisma'
//
// Never import this in client components or browser bundles.
export { prisma, default } from './db'
