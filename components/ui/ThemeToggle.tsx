"use client"

import React from 'react'
import { useTheme } from 'next-themes'

type ThemeChoice = 'system' | 'light' | 'dark'

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 14.2A8.4 8.4 0 0 1 9.8 3a6.8 6.8 0 1 0 11.2 11.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MonitorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16h-11A2.5 2.5 0 0 1 4 13.5v-8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 21h8M12 16v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (ref.current && !ref.current.contains(target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const effective = (resolvedTheme || theme) as ThemeChoice | undefined
  const Icon = effective === 'dark' ? MoonIcon : SunIcon

  if (!mounted) {
    return (
      <div
        className={[
          'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--orbit-line-strong)]',
          className,
        ].join(' ')}
        aria-hidden="true"
      />
    )
  }

  const pick = (t: ThemeChoice) => {
    setTheme(t)
    setOpen(false)
  }

  const item = (value: ThemeChoice, label: string, ItemIcon: typeof SunIcon) => {
    const active = theme === value
    return (
      <button
        type="button"
        onClick={() => pick(value)}
        className={[
          'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left',
          'hover:bg-[var(--surface-hover)]',
          active ? 'bg-[var(--surface-hover)] text-content' : 'text-content-secondary',
        ].join(' ')}
      >
        <ItemIcon className="h-4 w-4" />
        <span className="flex-1">{label}</span>
        {active && <span className="text-xs text-content-muted">Selected</span>}
      </button>
    )
  }

  return (
    <div ref={ref} className={['relative', className].join(' ')}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          'inline-flex items-center justify-center rounded-full border border-[var(--orbit-line-strong)]',
          'text-content hover:bg-[var(--surface-hover)] transition-colors',
          'h-9 w-9',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sun)]',
        ].join(' ')}
        title="Theme"
      >
        <Icon className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className={[
            'absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-[var(--orbit-line)]',
            'cosmos-glass p-1 shadow-2xl shadow-black/30',
          ].join(' ')}
        >
          {item('system', 'System', MonitorIcon)}
          {item('light', 'Daybreak', SunIcon)}
          {item('dark', 'Night', MoonIcon)}
        </div>
      )}
    </div>
  )
}

