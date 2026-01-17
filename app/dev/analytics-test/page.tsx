import React from 'react'
import TestAnalyticsClient from './TestAnalyticsClient'

export default function DevAnalyticsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-lg w-full">
        <TestAnalyticsClient />
      </div>
    </div>
  )
}
