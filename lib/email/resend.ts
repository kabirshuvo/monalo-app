/**
 * Resend HTTP API client (edge-safe — native fetch only).
 */

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SendEmailResult {
  ok: boolean
  id?: string
  error?: string
}

function getFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    'MonAlo <onboarding@resend.dev>'
  )
}

export function getPublicAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

export async function sendEmailViaResend(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY is not set; skipping email send')
    return { ok: false, error: 'Email service is not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: [options.to],
        subject: options.subject,
        html: options.html,
        ...(options.text ? { text: options.text } : {}),
      }),
    })

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string }
      | null

    if (!response.ok) {
      const message = payload?.message || `Resend API error (${response.status})`
      console.error('[Resend] send failed:', message)
      return { ok: false, error: message }
    }

    return { ok: true, id: payload?.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email'
    console.error('[Resend] send error:', message)
    return { ok: false, error: message }
  }
}

export async function sendMagicLinkEmail(
  email: string,
  url: string
): Promise<SendEmailResult> {
  const html = [
    '<div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">',
    '<h1 style="font-size: 1.5rem; color: #111827;">Sign in to MonAlo</h1>',
    '<p style="color: #374151; line-height: 1.5;">',
    'Click the button below to sign in. This link works once and expires in 30 minutes.',
    '</p>',
    '<p style="margin: 2rem 0;">',
    `<a href="${url}" style="background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">`,
    'Sign in to MonAlo',
    '</a>',
    '</p>',
    '<p style="color: #6b7280; font-size: 0.875rem;">',
    'Or copy this link into your browser:<br />',
    `<a href="${url}">${url}</a>`,
    '</p>',
    '<p style="color: #9ca3af; font-size: 0.75rem;">If you didn\u2019t request this, you can safely ignore this email.</p>',
    '</div>',
  ].join('')

  return sendEmailViaResend({
    to: email,
    subject: 'Your MonAlo sign-in link',
    html,
    text: `Sign in to MonAlo: ${url}`,
  })
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  const verifyUrl = `${getPublicAppBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`

  const html = [
    '<div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">',
    '<h1 style="font-size: 1.5rem; color: #111827;">Verify your MonAlo email</h1>',
    '<p style="color: #374151; line-height: 1.5;">',
    'Thanks for signing up. Click the button below to verify your email address and activate your account.',
    '</p>',
    '<p style="margin: 2rem 0;">',
    `<a href="${verifyUrl}" style="background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">`,
    'Verify email',
    '</a>',
    '</p>',
    '<p style="color: #6b7280; font-size: 0.875rem;">',
    'Or copy this link into your browser:<br />',
    `<a href="${verifyUrl}">${verifyUrl}</a>`,
    '</p>',
    '<p style="color: #9ca3af; font-size: 0.75rem;">This link expires in 24 hours.</p>',
    '</div>',
  ].join('')

  return sendEmailViaResend({
    to: email,
    subject: 'Verify your MonAlo email',
    html,
    text: `Verify your MonAlo email: ${verifyUrl}`,
  })
}
