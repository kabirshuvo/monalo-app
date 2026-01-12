"use client"
import React from 'react'
import Button from './Button'

export type EmptyStateVariant = 'generic' | 'blog' | 'courses-learner' | 'courses-instructor' | 'cart' | 'orders'

export interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

const variantContent: Record<EmptyStateVariant, { title: string; description: string; actionLabel: string }> = {
  generic: {
    title: 'Nothing here yet',
    description: 'This space is waiting for something wonderful.',
    actionLabel: 'Get started'
  },
  blog: {
    title: 'No articles yet',
    description: 'The first story is always the hardest to write—and the most rewarding.',
    actionLabel: 'Start writing'
  },
  'courses-learner': {
    title: 'Your learning journey begins here',
    description: 'Browse our collection and find what sparks your curiosity.',
    actionLabel: 'Explore courses'
  },
  'courses-instructor': {
    title: 'Ready to teach?',
    description: 'Share your knowledge and light the way for others.',
    actionLabel: 'Create your first course'
  },
  cart: {
    title: 'Your cart is empty',
    description: 'Discover something that speaks to you.',
    actionLabel: 'Browse shop'
  },
  orders: {
    title: 'No orders yet',
    description: 'When you make a purchase, it will appear here.',
    actionLabel: 'Start shopping'
  }
}

const defaultIcons: Record<EmptyStateVariant, React.ReactNode> = {
  generic: (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  blog: (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  'courses-learner': (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'courses-instructor': (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  cart: (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  orders: (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

export default function EmptyState({
  variant = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  icon
}: EmptyStateProps) {
  const content = variantContent[variant]
  const displayTitle = title ?? content.title
  const displayDescription = description ?? content.description
  const displayActionLabel = actionLabel ?? content.actionLabel
  const displayIcon = icon ?? defaultIcons[variant]

  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="mb-6">
        {displayIcon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-gray-600 max-w-md mb-6">
        {displayDescription}
      </p>

      {/* Action Button */}
      {onAction && (
        <Button onClick={onAction} variant="primary">
          {displayActionLabel}
        </Button>
      )}
    </div>
  )
}
