/** Map Auth.js `?error=` query values to user-facing copy. */
export function messageForAuthError(code: string | null | undefined): string | null {
  if (!code) return null

  switch (code) {
    case 'OAuthAccountNotLinked':
      return 'This email is already registered with a password. Sign in with email and password, or use the same Google account after we link it (try Google again).'
    case 'OAuthSignin':
    case 'OAuthCallback':
      return 'Google sign-in failed. Check that redirect URIs are configured in Google Cloud Console, then try again.'
    case 'Configuration':
      return 'Sign-in is not configured correctly on the server. Contact support if this continues.'
    case 'AccessDenied':
      return 'Access was denied. You may have cancelled Google sign-in.'
    case 'Verification':
      return 'The sign-in link expired. Please try again.'
    case 'EmailNotVerified':
      return 'Please verify your email before signing in.'
    case 'CredentialsSignin':
      return "That email or password didn't work. Please try again."
    default:
      return 'Sign-in failed. Please try again or use email and password.'
  }
}
