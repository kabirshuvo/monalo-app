"use client"
import React from 'react'
import LoadingState, { SmartLoaderMark } from './LoadingState'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** @deprecated Prefer SmartLoaderMark or LoadingState */
export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div className={className}>
      <SmartLoaderMark size={size} />
    </div>
  )
}

export function LoadingScreen({ message }: { message?: string }) {
  return <LoadingState variant="page" message={message} fullScreen />
}
