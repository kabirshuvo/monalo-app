import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { prisma } from '@/lib/db'
import { getPointsBreakdown, getRecentPointEvents } from '@/lib/points/service'
import { badgeFromTotalPoints, levelFromTotalPoints } from '@/lib/points/config'
import { normalizeAvatarValue } from '@/lib/avatars/presets'
import { ensureDatabaseUserForAuth } from '@/lib/auth/ensure-database-user'
import { getAuthJwtFromCookies } from '@/lib/auth/session-token'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jwt = await getAuthJwtFromCookies()
    const userId = await ensureDatabaseUserForAuth(session, jwt)

    if (!userId) {
      console.warn('[GET /api/profile] no user for session', {
        sessionId: session.user.id?.slice(0, 8),
        hasEmail: Boolean(session.user.email ?? jwt?.email),
      })
      return NextResponse.json(
        { error: 'Account not found. Please sign out and sign in again.' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        bio: true,
        avatarUrl: true,
        emailVerified: true,
        totalPoints: true,
        level: true,
        badge: true,
        createdAt: true,
      },
    })

    if (!user) {
      console.warn('[GET /api/profile] resolved id missing row', { userId: userId.slice(0, 8) })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let pointsBreakdown: Awaited<ReturnType<typeof getPointsBreakdown>> | null = null
    let recentActivity: Awaited<ReturnType<typeof getRecentPointEvents>> = []
    try {
      ;[pointsBreakdown, recentActivity] = await Promise.all([
        getPointsBreakdown(userId),
        getRecentPointEvents(userId, 8),
      ])
    } catch (pointsErr) {
      console.error('[GET /api/profile] points data unavailable:', pointsErr)
    }

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatarUrl || session.user.image || null,
      role: user.role,
      bio: user.bio,
      level: user.level || levelFromTotalPoints(user.totalPoints),
      badge: user.badge || badgeFromTotalPoints(user.totalPoints),
      points: user.totalPoints,
      isVerified: Boolean(user.emailVerified),
      createdAt: user.createdAt.toISOString(),
      pointsBreakdown: pointsBreakdown ?? undefined,
      recentActivity: recentActivity.map((e) => ({
        id: e.id,
        category: e.category,
        points: e.points,
        description: e.description,
        createdAt: e.createdAt.toISOString(),
      })),
    }

    return NextResponse.json({ ok: true, profile })
  } catch (error) {
    console.error('[GET /api/profile]', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jwt = await getAuthJwtFromCookies()
    const userId = await ensureDatabaseUserForAuth(session, jwt)
    if (!userId) {
      return NextResponse.json(
        { error: 'Account not found. Please sign out and sign in again.' },
        { status: 404 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const allowedFields = ['name', 'avatar', 'phone', 'bio', 'avatarUrl'] as const
    const updates: Record<string, string | null> = {}

    for (const field of allowedFields) {
      if (field in body) {
        const key = field === 'avatar' ? 'avatarUrl' : field
        const value = body[field]
        updates[key] = value === '' || value == null ? null : String(value).trim()
      }
    }

    if (updates.phone) {
      updates.phone = updates.phone.replace(/(?!^\+)\D/g, '')
    }

    if ('avatarUrl' in updates) {
      const normalized = normalizeAvatarValue(updates.avatarUrl)
      if (updates.avatarUrl && normalized === null) {
        return NextResponse.json({ error: 'Invalid avatar selection' }, { status: 400 })
      }
      updates.avatarUrl = normalized
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        bio: true,
        avatarUrl: true,
        totalPoints: true,
        level: true,
        badge: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    let pointsBreakdown: Awaited<ReturnType<typeof getPointsBreakdown>> | undefined
    try {
      pointsBreakdown = await getPointsBreakdown(user.id)
    } catch (pointsErr) {
      console.error('[PATCH /api/profile] points breakdown unavailable:', pointsErr)
    }

    return NextResponse.json({
      ok: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatarUrl || session.user.image || null,
        role: user.role,
        bio: user.bio,
        level: user.level,
        badge: user.badge,
        points: user.totalPoints,
        isVerified: Boolean(user.emailVerified),
        createdAt: user.createdAt.toISOString(),
        pointsBreakdown,
      },
    })
  } catch (error) {
    console.error('[PATCH /api/profile]', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
