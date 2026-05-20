"use client"

import { useEffect, useState, useCallback } from 'react'

export function useEnrollment() {
  const [enrolledIds, setEnrolledIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/learning/enrolled')
      if (res.status === 401) {
        setEnrolledIds([])
        return
      }
      const data = await res.json()
      const ids = (data.courses || []).map((c: { id: string }) => c.id)
      setEnrolledIds(ids)
    } catch {
      setEnrolledIds([])
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setMounted(true))
  }, [refresh])

  const isEnrolled = useCallback(
    (courseId: string) => enrolledIds.includes(courseId),
    [enrolledIds]
  )

  const enroll = useCallback(async (courseId: string) => {
    if (enrolledIds.includes(courseId)) return false
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' })
      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=/courses`
        return false
      }
      const data = await res.json()
      if (res.ok && (data.enrolled || data.alreadyEnrolled)) {
        if (!data.alreadyEnrolled) {
          setEnrolledIds((prev) => [...prev, courseId])
        } else {
          await refresh()
        }
        return !data.alreadyEnrolled
      }
    } catch {
      // ignore
    }
    return false
  }, [enrolledIds, refresh])

  const unenroll = useCallback((courseId: string) => {
    setEnrolledIds((prev) => prev.filter((id) => id !== courseId))
  }, [])

  return { mounted, enrolledIds, isEnrolled, enroll, unenroll, refresh }
}
