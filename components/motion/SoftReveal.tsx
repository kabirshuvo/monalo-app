'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

type SoftRevealProps = {
  children: ReactNode
  className?: string
  /** Stagger delay in ms once visible */
  delay?: number
  as?: ElementType
  /** Soft lift from below (default) or fade only */
  variant?: 'up' | 'fade' | 'left' | 'scale'
  /**
   * When true, direct children (eyebrow, title, body, CTAs) cascade in
   * after the block enters the viewport.
   */
  lines?: boolean
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'>

function isInView(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  return rect.top < vh * 0.9 && rect.bottom > vh * 0.05
}

/** Soft scroll-in used on gallery, home, and landing. */
export function SoftReveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
  variant = 'up',
  lines = false,
  ...rest
}: SoftRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    // Already on screen (above-the-fold, fast scroll, etc.)
    if (isInView(el)) {
      // Next frame so the hidden → shown transition still plays
      const id = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(id)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      {
        // Trigger while the block is still entering from below
        rootMargin: '0px 0px -10% 0px',
        threshold: [0, 0.05, 0.12, 0.2],
      },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const style = {
    ...(typeof rest.style === 'object' && rest.style ? rest.style : {}),
    ['--gallery-reveal-delay' as string]: `${delay}ms`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      ref={ref}
      style={style}
      data-soft-lines={lines ? '' : undefined}
      className={`gallery-soft-reveal gallery-soft-reveal--${variant}${visible ? ' is-in' : ''} ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}
