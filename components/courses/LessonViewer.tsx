"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import Button from '@/components/ui/Button'
import LoadingState from '@/components/ui/LoadingState'
import CourseProgress from '@/components/courses/CourseProgress'
import api from '@/lib/api'

interface Lesson {
  id: string
  courseId: string
  title: string
  description?: string
  content?: string
  order: number
  duration?: number
  videoUrl?: string
}

interface LessonViewerProps {
  courseId: string
  lessonId: string
}

export default function LessonViewer({ courseId, lessonId }: LessonViewerProps) {
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [trackingProgress, setTrackingProgress] = useState(false)

  useEffect(() => {
    async function loadLesson() {
      setLoading(true)
      try {
        // Fetch all lessons for navigation
        const res = await api.get<{ ok: boolean; lessons: Lesson[] }>(
          `/api/courses/${courseId}/lessons`
        )
        const lessons = res?.lessons || []
        setAllLessons(lessons)

        // Find current lesson
        const current = lessons.find((l) => l.id === lessonId)
        setLesson(current || null)
      } catch (error) {
        console.error('Failed to load lesson', error)
      } finally {
        setLoading(false)
      }
    }
    loadLesson()
  }, [courseId, lessonId])

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const markCompleted = async () => {
    if (!lesson) return
    setTrackingProgress(true)
    try {
      await api.post(`/api/lessons/${lesson.id}/progress`, {
        completed: true,
        watchedMinutes: Math.floor((lesson.duration || 0) / 60)
      })
      // Mark as completed locally
      setCompletedLessons((prev) => new Set([...prev, lesson.id]))
      
      // Move to next lesson if available
      if (nextLesson) {
        router.push(`/dashboard/learning/courses/${courseId}/lessons/${nextLesson.id}`)
      } else {
        router.push('/dashboard/learning')
      }
    } catch (error) {
      console.error('Failed to track progress', error)
    } finally {
      setTrackingProgress(false)
    }
  }

  const navigateToLesson = (targetId: string) => {
    router.push(`/dashboard/learning/courses/${courseId}/lessons/${targetId}`)
  }

  if (loading) {
    return <LoadingState variant="lesson" />
  }

  if (!lesson) {
    return (
      <Card>
        <CardContent>
          <p className="text-gray-600 text-center py-8">Lesson not found.</p>
          <div className="text-center">
            <Button variant="secondary" onClick={() => router.push('/dashboard/learning')}>
              Back to learning
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Progress Overview */}
      <Card>
        <CardContent>
          <CourseProgress
            completed={completedLessons.size}
            total={allLessons.length}
            variant="compact"
          />
        </CardContent>
      </Card>

      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Lesson {lesson.order}</div>
              <CardTitle>{lesson.title}</CardTitle>
              {lesson.description && (
                <p className="text-gray-600 mt-2">{lesson.description}</p>
              )}
            </div>
            {lesson.duration && (
              <div className="text-sm text-gray-500 whitespace-nowrap">
                {Math.floor(lesson.duration / 60)} min
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Lesson Content */}
      <Card>
        <CardContent>
          {lesson.videoUrl && (
            <div className="mb-6 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Video player placeholder</p>
            </div>
          )}
          <div className="prose prose-blue max-w-none">
            {lesson.content?.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return <h1 key={i} className="text-3xl font-bold text-gray-900 mt-8 mb-4">{line.slice(2)}</h1>
              }
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-semibold text-gray-900 mt-6 mb-3">{line.slice(3)}</h2>
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-semibold text-gray-900 mt-4 mb-2">{line.slice(4)}</h3>
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="text-gray-700 ml-4">{line.slice(2)}</li>
              }
              if (line.trim() === '') {
                return <div key={i} className="h-4" />
              }
              return <p key={i} className="text-gray-700 leading-relaxed mb-4">{line}</p>
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              {prevLesson ? (
                <Button variant="ghost" onClick={() => navigateToLesson(prevLesson.id)}>
                  ← Previous: {prevLesson.title}
                </Button>
              ) : (
                <div />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard/learning')}
              >
                Back to dashboard
              </Button>
              <Button
                onClick={markCompleted}
                isLoading={trackingProgress}
              >
                {nextLesson ? 'Complete & Continue' : 'Complete lesson'}
              </Button>
            </div>
            <div>
              {nextLesson ? (
                <Button variant="ghost" onClick={() => navigateToLesson(nextLesson.id)}>
                  Next: {nextLesson.title} →
                </Button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
