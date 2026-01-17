export const subject = 'Reset your MonAlo password'

export function textBody(resetLink: string) {
  return `Hi,

We received a request to reset the password for your MonAlo account.

Click the link below to set a new password:
${resetLink}

This link will expire in 30 minutes and can only be used once.

If you didn’t request a password reset, you can safely ignore this email.

— MonAlo Team`
}

export function htmlBody(resetLink: string) {
  // Simple, clean HTML with a prominent button linking to the reset URL
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Reset your MonAlo password</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background:#f7f7f7; margin:0; padding:24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff; border-radius:8px; padding:32px; text-align:left;">
            <tr>
              <td>
                <h1 style="margin:0 0 12px 0; font-size:20px; color:#111827;">Reset your MonAlo password</h1>
                <p style="color:#374151; line-height:1.5; margin:0 0 18px 0;">Hi,</p>

                <p style="color:#374151; line-height:1.5; margin:0 0 18px 0;">We received a request to reset the password for your MonAlo account.</p>

                <p style="margin:0 0 18px 0;"><a href="${resetLink}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:6px;">Set a new password</a></p>

                <p style="color:#374151; line-height:1.5; margin:18px 0 18px 0;">This link will expire in 30 minutes and can only be used once.</p>

                <p style="color:#374151; line-height:1.5; margin:0 0 18px 0;">If you didn’t request a password reset, you can safely ignore this email.</p>

                <p style="color:#374151; margin-top:24px;">— MonAlo Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

// Convenience: template with placeholder for systems that prefer {{RESET_LINK}}
export const placeholderText = `Hi,\n\nWe received a request to reset the password for your MonAlo account.\n\nClick the link below to set a new password:\n{{RESET_LINK}}\n\nThis link will expire in 30 minutes and can only be used once.\n\nIf you didn’t request a password reset, you can safely ignore this email.\n\n— MonAlo Team`

export const placeholderHtml = `<!doctype html><html><body><p>Hi,</p><p>We received a request to reset the password for your MonAlo account.</p><p><a href="{{RESET_LINK}}">Set a new password</a></p><p>This link will expire in 30 minutes and can only be used once.</p><p>If you didn’t request a password reset, you can safely ignore this email.</p><p>— MonAlo Team</p></body></html>`

export function smsBody(resetLink: string) {
  return `MonAlo: Reset your password using this link:\n${resetLink}\nThis link expires in 30 minutes.`
}

export const placeholderSms = `MonAlo: Reset your password using this link:\n{{RESET_LINK}}\nThis link expires in 30 minutes.`
