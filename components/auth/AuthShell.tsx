import Link from 'next/link'

type AuthShellProps = {
  children: React.ReactNode
  title: string
  subtitle: string
  footer?: React.ReactNode
}

export function AuthShell({ children, title, subtitle, footer }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.08),_transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border-subtle) 1px, transparent 1px), linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-content transition-opacity hover:opacity-80"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </span>
              <span className="text-4xl font-semibold tracking-tight">MonAlo</span>
            </Link>
            <h1 className="mt-8 text-2xl font-semibold tracking-tight text-content sm:text-3xl">
              {title}
            </h1>
            <p className="mt-3 text-base text-content-muted">{subtitle}</p>
          </div>

          <div className="rounded-3xl border border-subtle bg-surface/90 p-8 shadow-xl shadow-stone-900/5 backdrop-blur-sm dark:shadow-black/40">
            {children}
          </div>

          {footer ? <div className="mt-8 text-center text-sm text-content-muted">{footer}</div> : null}

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-content-muted transition-colors hover:text-content">
              ← Back to landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
