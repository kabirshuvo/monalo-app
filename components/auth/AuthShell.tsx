import Link from 'next/link'
import SunMark from '@/components/cosmos/SunMark'
import PlanetOrb from '@/components/cosmos/PlanetOrb'

type AuthShellProps = {
  children: React.ReactNode
  title: string
  subtitle: string
  footer?: React.ReactNode
}

/** Sign-in, register and recovery screens: a quiet panel beneath a rising sun. */
export function AuthShell({ children, title, subtitle, footer }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      {/* Orbits and the sun, low on the horizon */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <span className="hero-arc left-1/2 top-[-22rem] h-[44rem] w-[44rem] -translate-x-1/2" />
        <span className="hero-arc left-1/2 top-[-34rem] h-[68rem] w-[68rem] -translate-x-1/2 border-dashed" />
        <span className="absolute left-1/2 top-[-6.5rem] -translate-x-1/2">
          <PlanetOrb planet="sun" size={200} />
        </span>
        <span className="absolute left-[calc(50%+16.3rem)] top-[13.2rem] hidden sm:block">
          <PlanetOrb planet="earth" size={26} />
        </span>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-40 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-content transition-opacity hover:opacity-85"
              aria-label="MonAlo, home"
            >
              <SunMark className="h-10 w-10" />
              <span className="font-serif text-3xl font-medium tracking-tight">MonAlo</span>
            </Link>
            <h1 className="mt-7 text-3xl font-normal tracking-tight text-content sm:text-4xl">{title}</h1>
            <p className="mt-3 text-base text-content-muted">{subtitle}</p>
          </div>

          <div className="cosmos-glass rounded-[2rem] border border-[var(--orbit-line)] p-8 shadow-2xl shadow-black/20">
            {children}
          </div>

          {footer ? <div className="mt-8 text-center text-sm text-content-muted">{footer}</div> : null}

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-content-muted transition-colors hover:text-content">
              Back to the solar system
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
