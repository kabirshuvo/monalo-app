// lib/db.ts
import { PrismaClient } from '@prisma/client'

// Prevent instantiation of multiple PrismaClient instances during hot reload
// This is critical for Next.js App Router with fast refresh
declare global {
  var prisma: PrismaClient | undefined
}

const isDevelopment = process.env.NODE_ENV === 'development'

export const prisma =
  global.prisma ||
  new PrismaClient({
    // Log configuration
    // In development: log all queries, warnings, and errors
    // In production: only log errors to minimize overhead in serverless
    log: isDevelopment
      ? [
          { level: 'query', emit: 'stdout' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }],
    // Error formatting
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
  })

// Persist PrismaClient instance in development to prevent multiple instances
// during Next.js hot reload
if (isDevelopment) {
  global.prisma = prisma
}

export default prisma
