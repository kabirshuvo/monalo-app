"use client"
import React from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export type Course = {
  id: string
  title: string
  summary: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
  duration?: string
  progress?: number
  enrolled?: boolean
}

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const { id, title, summary, level, duration, progress = 0, enrolled } = course
  const isEnrolled = Boolean(enrolled)
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{summary}</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          {level && <Badge size="sm" variant="info">{level}</Badge>}
          {duration && <span className="text-xs text-gray-500">{duration}</span>}
        </div>
      </div>

      {isEnrolled ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>In progress</span>
            <span className="font-semibold">{clampedProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
          <Button size="sm" onClick={() => console.log(`Continue course ${id}`)}>
            Continue learning
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Not enrolled yet</p>
          <Button size="sm" onClick={() => console.log(`Enroll in course ${id}`)}>
            Start this course
          </Button>
        </div>
      )}
    </div>
  )
}
