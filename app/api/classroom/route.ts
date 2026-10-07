import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { prisma } from '@/lib/db'
import { ensureTeacherRole, getTeacherClassroom } from '@/lib/classroom/data'
import { LEARNER_AVATARS } from '@/lib/classroom/constants'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const classroom = await getTeacherClassroom(session.user.id)
  return NextResponse.json({ classroom })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const name = String(body.name ?? '').trim().slice(0, 120)
  const schoolName = String(body.schoolName ?? '').trim().slice(0, 160) || null
  if (!name) {
    return NextResponse.json({ error: 'Class name required' }, { status: 400 })
  }

  const existing = await getTeacherClassroom(session.user.id)
  if (existing) {
    const updated = await prisma.classroom.update({
      where: { id: existing.id },
      data: { name, schoolName },
      include: { learners: { where: { active: true }, orderBy: { displayName: 'asc' } } },
    })
    return NextResponse.json({ classroom: updated })
  }

  await ensureTeacherRole(session.user.id, session.user.role ?? 'LEARNER')

  const classroom = await prisma.classroom.create({
    data: {
      teacherId: session.user.id,
      name,
      schoolName,
    },
    include: { learners: true },
  })

  return NextResponse.json({ classroom }, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const action = String(body.action ?? '')
  const classroom = await getTeacherClassroom(session.user.id)
  if (!classroom) {
    return NextResponse.json({ error: 'Create a class first' }, { status: 400 })
  }

  if (action === 'add-learner') {
    const displayName = String(body.displayName ?? '').trim().slice(0, 80)
    const avatarKey = String(body.avatarKey ?? 'penguin').trim()
    const rollNo = String(body.rollNo ?? '').trim().slice(0, 32) || null
    if (!displayName) {
      return NextResponse.json({ error: 'Kid name required' }, { status: 400 })
    }
    const validAvatar = LEARNER_AVATARS.some((a) => a.key === avatarKey) ? avatarKey : 'penguin'
    const learner = await prisma.learnerProfile.create({
      data: {
        classroomId: classroom.id,
        displayName,
        avatarKey: validAvatar,
        rollNo,
      },
    })
    return NextResponse.json({ learner }, { status: 201 })
  }

  if (action === 'update-learner') {
    const id = String(body.id ?? '').trim()
    const displayName = String(body.displayName ?? '').trim().slice(0, 80)
    const avatarKey = String(body.avatarKey ?? 'penguin').trim()
    const rollNo = String(body.rollNo ?? '').trim().slice(0, 32) || null
    if (!id || !displayName) {
      return NextResponse.json({ error: 'Invalid learner' }, { status: 400 })
    }
    const owned = classroom.learners.find((l) => l.id === id)
    if (!owned) {
      return NextResponse.json({ error: 'Learner not found' }, { status: 404 })
    }
    const validAvatar = LEARNER_AVATARS.some((a) => a.key === avatarKey) ? avatarKey : 'penguin'
    const learner = await prisma.learnerProfile.update({
      where: { id },
      data: { displayName, avatarKey: validAvatar, rollNo },
    })
    return NextResponse.json({ learner })
  }

  if (action === 'remove-learner') {
    const id = String(body.id ?? '').trim()
    const owned = classroom.learners.find((l) => l.id === id)
    if (!owned) {
      return NextResponse.json({ error: 'Learner not found' }, { status: 404 })
    }
    await prisma.learnerProfile.update({
      where: { id },
      data: { active: false },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
