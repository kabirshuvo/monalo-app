"use client"
import React from 'react'

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  orientation?: 'horizontal' | 'vertical'
}

export default function RadioGroup({ 
  name,
  options,
  value,
  onChange,
  label,
  error,
  orientation = 'vertical'
}: RadioGroupProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className={`flex ${orientation === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2'}`}>
        {options.map((option) => {
          const inputId = `${name}-${option.value}`
          return (
            <div key={option.value} className="flex items-center">
              <input
                id={inputId}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500
                  ${error ? 'border-red-500' : ''}
                  disabled:cursor-not-allowed disabled:opacity-50`}
              />
              <label 
                htmlFor={inputId} 
                className={`ml-2 text-sm text-gray-700 cursor-pointer ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {option.label}
              </label>
            </div>
          )
        })}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
