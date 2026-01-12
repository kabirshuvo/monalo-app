"use client"
import React from 'react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

export default function Checkbox({ 
  label,
  error,
  className = '',
  id,
  ...props 
}: CheckboxProps) {
  const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={inputId}
          type="checkbox"
          className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 
            ${error ? 'border-red-500' : ''}
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}`}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-3 text-sm">
          <label htmlFor={inputId} className="font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
