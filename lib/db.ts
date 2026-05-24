// lib/db.ts — Prisma client (Node dev + Cloudflare Workers via Accelerate)
import type { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const isDevelopment = process.env.NODE_ENV === 'development'

function isAccelerateConnectionString(url: string | undefined): boolean {
  if (!url) return false
  return url.startsWith('prisma://') || url.startsWith('prisma+postgres://')
}

function resolveAccelerateUrl(): string | undefined {
  if (process.env.ACCELERATE_URL) return process.env.ACCELERATE_URL
  if (isAccelerateConnectionString(process.env.DATABASE_URL)) {
    return process.env.DATABASE_URL
  }
  return undefined
}

function createPrismaClient(): PrismaClient {
  const accelerateUrl = resolveAccelerateUrl()
  const log = isDevelopment
    ? [
        { level: 'query' as const, emit: 'stdout' as const },
        { level: 'error' as const, emit: 'stdout' as const },
        { level: 'warn' as const, emit: 'stdout' as const },
      ]
    : [{ level: 'error' as const, emit: 'stdout' as const }]

  if (accelerateUrl) {
    // Edge client + Accelerate — no Rust query engine (required on Cloudflare Workers)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient: PrismaClientEdge } = require('@prisma/client/edge')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withAccelerate } = require('@prisma/extension-accelerate')
    return new PrismaClientEdge({
      datasourceUrl: accelerateUrl,
      log,
      errorFormat: isDevelopment ? 'pretty' : 'minimal',
    }).$extends(withAccelerate()) as unknown as PrismaClient
  }

  // Local dev / migrations tooling — direct Neon
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient: PrismaClientNode } = require('@prisma/client')
  return new PrismaClientNode({
    log,
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
  })
}

const client = global.prisma ?? createPrismaClient()

export const prisma = client

if (isDevelopment) {
  global.prisma = client
}

export default prisma
