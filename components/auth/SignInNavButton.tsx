'use client'

import Button from '@/components/ui/Button'
import { triggerSignIn } from '@/lib/auth/trigger-sign-in'

type SignInNavButtonProps = {
  variant?: 'ghost' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  label?: string
  className?: string
}

export default function SignInNavButton({
  variant = 'ghost',
  size = 'sm',
  fullWidth = false,
  label = 'Sign in',
  className,
}: SignInNavButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      onClick={() => triggerSignIn()}
    >
      {label}
    </Button>
  )
}
