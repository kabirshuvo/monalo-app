import { NextResponse } from 'next/server'

/**
 * GET /api/courses/:courseId/lessons
 * Returns sample lessons for a course
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  
  // Sample lessons for demo
  const lessons = [
    {
      id: 'l-001',
      courseId,
      title: 'Introduction: Why Learning Matters',
      description: 'A gentle start to understanding how you learn best.',
      content: `# Introduction: Why Learning Matters

Learning isn't about speed. It's about building a relationship with what you're curious about.

## What We'll Cover

- Understanding your learning style
- Setting kind, sustainable goals
- Building habits that stick

## Key Takeaway

You're already equipped to learn anything. We're just here to light the way.`,
      order: 1,
      duration: 420, // 7 minutes
      videoUrl: null
    },
    {
      id: 'l-002',
      courseId,
      title: 'Building Your Learning Routine',
      description: 'Small, consistent steps create lasting change.',
      content: `# Building Your Learning Routine

Consistency beats intensity. Start with what feels manageable.

## Creating Space

- Choose a time that works for you
- Keep your environment calm and distraction-free
- Set a timer—even 10 minutes counts

## Reflection Exercise

What's one small habit you can commit to this week?`,
      order: 2,
      duration: 540, // 9 minutes
      videoUrl: null
    },
    {
      id: 'l-003',
      courseId,
      title: 'Overcoming Learning Blocks',
      description: 'When progress stalls, here\'s how to move forward gently.',
      content: `# Overcoming Learning Blocks

Stuck? That\'s part of the process. Here\'s how to navigate it.

## Common Blocks

- Perfectionism: "It has to be perfect before I start."
- Comparison: "Everyone else is further ahead."
- Overwhelm: "There\'s too much to learn."

## Gentle Strategies

1. Lower the bar—progress over perfection
2. Focus on your path, not someone else's
3. Break it down into the smallest next step

You're doing better than you think.`,
      order: 3,
      duration: 660, // 11 minutes
      videoUrl: null
    }
  ]

  return NextResponse.json({ ok: true, lessons })
}
