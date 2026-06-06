'use client'

export const SIGNED_OUT_FLAG = 'monalo_signed_out'

/** Mark that the user chose to sign out (prevents silent re-login + guest UI). */
export function markSignedOut(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SIGNED_OUT_FLAG, Date.now().toString())
    sessionStorage.removeItem('monalo_login_start')
  }
}

export function clearSignedOutFlag(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SIGNED_OUT_FLAG)
  }
}

/** Call when the user explicitly clicks Sign in / Start today (not when session API responds). */
export function beginExplicitSignIn(): boolean {
  const wasGuestAfterSignOut = isGuestAfterSignOut()
  clearSignedOutFlag()
  return wasGuestAfterSignOut
}

/** True while the user should stay a guest after signing out (no session refetch UI). */
export function isGuestAfterSignOut(): boolean {
  if (typeof window === 'undefined') return false
  const raw = sessionStorage.getItem(SIGNED_OUT_FLAG)
  if (!raw) return false
  const ts = parseInt(raw, 10)
  if (Number.isNaN(ts)) return true
  return Date.now() - ts < 30 * 60 * 1000
}

/**
 * Navigate to server logout (clears httpOnly cookies) then land on guest landing.
 */
export function clientSignOut(redirectTo = '/?signedOut=1'): void {
  markSignedOut()
  const path = redirectTo.startsWith('/') ? redirectTo : '/?signedOut=1'
  const qs = path.includes('signedOut') ? path : `${path}${path.includes('?') ? '&' : '?'}signedOut=1`
  window.location.href = `/api/auth/logout?redirect=${encodeURIComponent(qs)}`
}
