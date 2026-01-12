"use client"
import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'monalo-enrollments'

function loadEnrolled(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function saveEnrolled(ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

export function useEnrollment() {
  const [enrolledIds, setEnrolledIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setEnrolledIds(loadEnrolled())
    setMounted(true)
  }, [])

  const isEnrolled = useCallback((courseId: string) => {
    return enrolledIds.includes(courseId)
  }, [enrolledIds])

  const enroll = useCallback((courseId: string) => {
    // Avoid duplicates
    if (enrolledIds.includes(courseId)) return false
    const next = [...enrolledIds, courseId]
    setEnrolledIds(next)
    saveEnrolled(next)
    return true
  }, [enrolledIds])

  const unenroll = useCallback((courseId: string) => {
    const next = enrolledIds.filter((id) => id !== courseId)
    setEnrolledIds(next)
    saveEnrolled(next)
  }, [enrolledIds])

  return { mounted, enrolledIds, isEnrolled, enroll, unenroll }
}
