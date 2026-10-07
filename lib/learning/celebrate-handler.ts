import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth-server'
import { resolveLearnerScope } from '@/lib/classroom/celebrate-scope'
import { getPointsBreakdown, type LearnerScope } from '@/lib/points/service'

export type CelebrateContext = {
  userId: string
  scope: LearnerScope
  body: Record<string, unknown>
}

export type CelebrateOutcome = {
  result: { awarded: boolean; points: number }
  revalidate: string[]
}

type CelebrateRun = (ctx: CelebrateContext) => Promise<CelebrateOutcome | NextResponse>

type CelebrateOptions = {
  /** Respond 200 with a no-points payload for signed-out users instead of 401. */
  allowGuest?: boolean
}

/** Read a trimmed string field from a JSON body. */
export function bodyString(body: Record<string, unknown>, key: string): string {
  return String(body[key] ?? '').trim()
}

export function celebrateError(error: string, status: number) {
  return NextResponse.json({ error }, { status })
}

/**
 * Shared POST handler for `/api/learning/<activity>/celebrate`: auth, learner scope,
 * body parsing, points breakdown, revalidation, response shape and error logging.
 * Each route supplies only its lookup + award step via `run`.
 */
export function createCelebrateHandler(
  routeName: string,
  run: CelebrateRun,
  options: CelebrateOptions = {}
) {
  return async function POST(request: Request) {
    try {
      const session = await auth()
      const userId = session?.user?.id
      if (!userId) {
        if (options.allowGuest) {
          return NextResponse.json({ ok: true, awarded: false, guest: true, points: 0 })
        }
        return celebrateError('Unauthorized', 401)
      }

      const scope = await resolveLearnerScope(userId)
      const rawBody: unknown = await request.json().catch(() => ({}))
      const body =
        rawBody && typeof rawBody === 'object' ? (rawBody as Record<string, unknown>) : {}

      const outcome = await run({ userId, scope, body })
      if (outcome instanceof NextResponse) return outcome

      const breakdown = await getPointsBreakdown(userId)
      for (const path of outcome.revalidate) revalidatePath(path)

      return NextResponse.json({
        ok: true,
        awarded: outcome.result.awarded,
        points: outcome.result.points,
        alreadyMastered: !outcome.result.awarded,
        breakdown,
      })
    } catch (error) {
      console.error(`[POST /api/learning/${routeName}/celebrate]`, error)
      return celebrateError('Failed to record progress', 500)
    }
  }
}
