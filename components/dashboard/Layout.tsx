import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <nav style={{ width: 220, padding: 16, borderRight: '1px solid #eee' }}>Dashboard Nav</nav>
      <section style={{ flex: 1, padding: 16 }}>{children}</section>
    </div>
  )
}
