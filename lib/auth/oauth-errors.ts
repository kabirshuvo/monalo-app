/** Map Auth.js `?error=` query values to user-facing copy. */
export function messageForAuthError(code: string | null | undefined): string | null {
  if (!code) return null

  switch (code) {
    case 'OAuthAccountNotLinked':
      return 'This email is already linked to another sign-in method. Try Continue with Google again, or contact support if it keeps failing.'
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
      return 'Sign-in failed. Please continue with Google.'
    default:
      return 'Sign-in failed. Please try Continue with Google again.'
  }
}
