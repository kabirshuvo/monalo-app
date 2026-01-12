"use client"
import React from 'react'

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

export function Form({ children, className = '', ...props }: FormProps) {
  return (
    <form className={`space-y-6 ${className}`} {...props}>
      {children}
    </form>
  )
}

export function FormSection({ 
  title, 
  description, 
  children,
  className = ''
}: { 
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

export function FormActions({ 
  children,
  align = 'right',
  className = ''
}: { 
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}) {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }
  
  return (
    <div className={`flex gap-3 pt-4 ${alignClass[align]} ${className}`}>
      {children}
    </div>
  )
}

export function FormGrid({ 
  children,
  columns = 2,
  className = ''
}: { 
  children: React.ReactNode
  columns?: 1 | 2 | 3
  className?: string
}) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }
  
  return (
    <div className={`grid ${colsClass[columns]} gap-4 ${className}`}>
      {children}
    </div>
  )
}
