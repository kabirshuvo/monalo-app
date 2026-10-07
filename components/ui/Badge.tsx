"use client"
import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

export default function Badge({ 
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-[var(--surface-hover)] text-content-secondary',
    success: 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-100',
    warning: 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
    danger: 'bg-rose-500/15 text-rose-900 dark:text-rose-100',
    info: 'bg-sky-500/15 text-sky-900 dark:text-sky-100'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  }
  
  return (
    <span 
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
