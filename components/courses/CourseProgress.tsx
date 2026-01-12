"use client"
import React from 'react'

export interface CourseProgressProps {
  completed: number
  total: number
  variant?: 'compact' | 'detailed'
  showPercentage?: boolean
}

/**
 * CourseProgress — Calm, non-gamified progress indicator
 * 
 * Shows step-based (X of Y) or percentage progress.
 * Designed for focused learning without distraction.
 */
export default function CourseProgress({
  completed,
  total,
  variant = 'compact',
  showPercentage = true
}: CourseProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
  
  if (variant === 'compact') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {completed} of {total} lessons
          </span>
          {showPercentage && (
            <span className="font-medium text-gray-900">
              {clampedPercentage}%
            </span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Your Progress</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">
            {completed} of {total}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">lessons completed</div>
        </div>
        {showPercentage && (
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {clampedPercentage}%
            </div>
          </div>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {completed === total && total > 0 && (
        <div className="text-sm text-gray-600 italic">
          You've completed this course. Well done.
        </div>
      )}
    </div>
  )
}
