'use client'

/** Sign-in methods we remember to highlight on return visits. */
export type SignInMethod = 'google' | 'credentials' | 'email' | 'facebook' | 'twitter'

const STORAGE_KEY = 'monalo_last_signin_method'

export function rememberSignInMethod(method: SignInMethod): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, method)
  } catch {
    // storage unavailable (private mode) — ignore
  }
}

export function getLastSignInMethod(): SignInMethod | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (
      value === 'google' ||
      value === 'credentials' ||
      value === 'email' ||
      value === 'facebook' ||
      value === 'twitter'
    ) {
      return value
    }
  } catch {
    // ignore
  }
  return null
}
