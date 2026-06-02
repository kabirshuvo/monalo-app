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

  // Cloudflare Workers freeze the isolate between requests, which kills any
  // idle TCP socket held by the pool. Reusing such a dead socket on the next
  // request makes the query hang forever → the runtime cancels the request with
  // a 1101 "Worker threw exception". To avoid this we never reuse a physical
  // connection across requests:
  //   - maxUses: 1            → destroy each connection right after its single use,
  //                             so the pool is empty when the next request starts.
  //   - allowExitOnIdle: true → don't keep the pool alive on idle connections.
  //   - *_timeout            → turn any residual stall into a fast error instead
  //                             of a Worker-killing hang.
  const isWorker = typeof process === 'undefined' || !isDevelopment
  const poolConfig = isWorker
    ? {
        connectionString: dbUrl,
        max: 3,
        maxUses: 1,
        allowExitOnIdle: true,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 15_000,
      }
    : { connectionString: dbUrl }
  const adapter = new PrismaPg(poolConfig)
  const base = new PrismaClientWasm({ adapter, log, errorFormat })

  if (!isWorker) return base as PrismaClient

  // Forcing a fresh connection per request (maxUses: 1) very occasionally hits a
  // transient "Failed to connect to upstream database" from the Prisma Postgres
  // pooler. That error means the query never reached the database, so it is safe
  // to retry. We only retry connection-establishment failures (never data errors),
  // which keeps writes idempotent.
  const isTransientConnError = (e: unknown): boolean => {
    const msg = e instanceof Error ? e.message : String(e ?? '')
    return (
      msg.includes('Failed to connect to upstream database') ||
      msg.includes("Can't reach database server") ||
      msg.includes('Connection terminated') ||
      msg.includes('Connection refused') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ECONNRESET')
    )
  }
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  return base.$extends({
    query: {
      async $allOperations({
        args,
        query,
      }: {
        args: unknown
        query: (a: unknown) => Promise<unknown>
      }) {
        let lastErr: unknown
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            return await query(args)
          } catch (e) {
            if (!isTransientConnError(e)) throw e
            lastErr = e
            await sleep(150 * (attempt + 1))
          }
        }
        throw lastErr
      },
    },
  }) as unknown as PrismaClient
}

const client = global.prisma ?? createPrismaClient()

export const prisma = client

if (isDevelopment) {
  global.prisma = client
}

export default prisma
