import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth-server'
import { ACTIVE_LEARNER_COOKIE } from '@/lib/classroom/constants'
import { getLearnerOwnedByTeacher } from '@/lib/classroom/data'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const learnerProfileId =
    body.learnerProfileId === null || body.learnerProfileId === ''
      ? null
      : String(body.learnerProfileId ?? '').trim() || null

  const jar = await cookies()

  if (!learnerProfileId) {
    jar.delete(ACTIVE_LEARNER_COOKIE)
    return NextResponse.json({ ok: true, learnerProfileId: null })
  }

  const owned = await getLearnerOwnedByTeacher(learnerProfileId, session.user.id)
  if (!owned) {
    return NextResponse.json({ error: 'Learner not found' }, { status: 404 })
  }

  jar.set(ACTIVE_LEARNER_COOKIE, owned.id, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return NextResponse.json({
    ok: true,
    learnerProfileId: owned.id,
    displayName: owned.displayName,
    avatarKey: owned.avatarKey,
  })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ learnerProfileId: null })
  }
  const jar = await cookies()
  const id = jar.get(ACTIVE_LEARNER_COOKIE)?.value ?? null
  if (!id) return NextResponse.json({ learnerProfileId: null })
  const owned = await getLearnerOwnedByTeacher(id, session.user.id)
  if (!owned) {
    jar.delete(ACTIVE_LEARNER_COOKIE)
    return NextResponse.json({ learnerProfileId: null })
  }
  return NextResponse.json({
    learnerProfileId: owned.id,
    displayName: owned.displayName,
    avatarKey: owned.avatarKey,
  })
}
