import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

function r2ImageRemotePatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const raw = process.env.R2_PUBLIC_BASE_URL
  if (!raw) return []
  try {
    const { protocol, hostname } = new URL(raw)
    if (hostname) {
      return [{ protocol: protocol.replace(':', '') as 'https' | 'http', hostname, pathname: '/**' }]
    }
  } catch {
    // ignore invalid URL
  }
  return []
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED: process.env.GOOGLE_CLIENT_ID ? 'true' : 'false',
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
