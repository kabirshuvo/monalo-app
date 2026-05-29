import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

type Params = { params: Promise<{ courseId: string }> }

export async function POST(_request: NextRequest, { params }: Params) {
  const { courseId } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
    })
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const existing = await prisma.courseEnrollment.findFirst({
      where: { userId, courseId, deletedAt: null },
    })
    if (existing) {
      return NextResponse.json({ ok: true, enrolled: true, alreadyEnrolled: true })
    }

    await prisma.courseEnrollment.create({
      data: { userId, courseId },
    })

    return NextResponse.json({ ok: true, enrolled: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/courses/[courseId]/enroll]', error)
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
  }
}
