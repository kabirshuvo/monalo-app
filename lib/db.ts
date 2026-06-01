// lib/db.ts — Prisma client singleton
//
// Entry point selection:
//   @prisma/client       → runtime/library.js  (LibraryEngine — needs native binary, uses fs.readdir)
//   @prisma/client/wasm  → runtime/wasm-engine-edge.js (WASM engine — no native binary, Workers-safe)
//
// esbuild in @opennextjs/cloudflare resolves `require('@prisma/client')` to index.js (LibraryEngine)
// even in a Workers bundle because it's a CJS require that doesn't pick up workerd conditions.
// We explicitly use '/wasm' to force the WASM engine, which works in both Workers and Node.js
// when paired with a driver adapter (PrismaPg).
import type { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const isDevelopment = process.env.NODE_ENV === 'development'

function isLegacyAccelerateUrl(url: string | undefined): boolean {
  if (!url) return false
  return url.startsWith('prisma://') || url.startsWith('prisma+postgres://')
}

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || ''
  const log = isDevelopment
    ? [
        { level: 'query' as const, emit: 'stdout' as const },
        { level: 'error' as const, emit: 'stdout' as const },
        { level: 'warn' as const, emit: 'stdout' as const },
      ]
    : [{ level: 'error' as const, emit: 'stdout' as const }]
  const errorFormat = isDevelopment ? 'pretty' as const : 'minimal' as const

  if (isLegacyAccelerateUrl(dbUrl)) {
    // Legacy Accelerate proxy (prisma:// or prisma+postgres://) — edge client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient: PrismaClientEdge } = require('@prisma/client/edge')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withAccelerate } = require('@prisma/extension-accelerate')
    return new PrismaClientEdge({
      datasourceUrl: dbUrl,
      log,
      errorFormat,
    }).$extends(withAccelerate()) as unknown as PrismaClient
  }

  // Standard postgres:// URL — WASM engine + PrismaPg driver adapter.
  // '@prisma/client/wasm' always resolves to the WASM engine entry point,
  // bypassing esbuild's CJS-condition resolution that would otherwise pick LibraryEngine.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient: PrismaClientWasm } = require('@prisma/client/wasm')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg')
  const adapter = new PrismaPg({ connectionString: dbUrl })
  return new PrismaClientWasm({ adapter, log, errorFormat }) as PrismaClient
}

const client = global.prisma ?? createPrismaClient()

export const prisma = client

if (isDevelopment) {
  global.prisma = client
}

export default prisma
