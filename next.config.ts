import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

function r2ImageRemotePatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const sources = [
    process.env.R2_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_ECO_PENGUIN_MEDIA_BASE_URL,
  ].filter((value): value is string => Boolean(value))

  const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = []
  const seen = new Set<string>()

  for (const raw of sources) {
    try {
      const { protocol, hostname } = new URL(raw)
      if (hostname && !seen.has(hostname)) {
        seen.add(hostname)
        patterns.push({
          protocol: protocol.replace(':', '') as 'https' | 'http',
          hostname,
          pathname: '/**',
        })
      }
    } catch {
      // ignore invalid URL
    }
  }

  return patterns
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED: process.env.GOOGLE_CLIENT_ID ? 'true' : 'false',
    NEXT_PUBLIC_MAGIC_LINK_ENABLED: process.env.RESEND_API_KEY ? 'true' : 'false',
  },
  images: {
    remotePatterns: r2ImageRemotePatterns(),
  },
}

export default nextConfig

// Only simulate Workers runtime during `next dev`, not production/OpenNext builds
if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev()
}
