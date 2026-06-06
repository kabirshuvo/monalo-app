'use client'

import Button from '@/components/ui/Button'
import { triggerSignIn } from '@/lib/auth/trigger-sign-in'

type StartTodayButtonProps = {
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

/**
 * Primary landing CTA: Google one-tap when enabled, otherwise login with return to home.
 */
export default function StartTodayButton({
  size = 'lg',
  fullWidth = false,
  className,
}: StartTodayButtonProps) {
  return (
    <Button
      type="button"
      variant="primary"
      size={size}
      fullWidth={fullWidth}
      className={className}
      onClick={() => triggerSignIn()}
    >
      Start today
    </Button>
  )
}
