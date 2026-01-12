"use client"
import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  characterCount?: boolean
  maxLength?: number
  required?: boolean
}

export default function Textarea({ 
  label,
  error,
  helperText,
  characterCount = false,
  maxLength,
  className = '',
  id,
  required,
  value,
  ...props 
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  const currentLength = typeof value === 'string' ? value.length : 0
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          id={textareaId}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          maxLength={maxLength}
          value={value}
          className={`w-full px-4 py-2.5 text-gray-900 bg-white border rounded-lg transition-all duration-200 resize-y min-h-[100px]
            placeholder:text-gray-400
            ${error 
              ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50' 
              : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
            }
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200
            ${className}`}
          required={required}
          {...props}
        />
        {characterCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
      {error && (
        <p 
          id={`${textareaId}-error`}
          className="mt-1.5 text-sm text-red-600 flex items-start gap-1"
          role="alert"
        >
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p 
          id={`${textareaId}-helper`}
          className="mt-1.5 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  )
}
