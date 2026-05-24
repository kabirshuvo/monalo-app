import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig

// Only simulate Workers runtime during `next dev`, not production/OpenNext builds
if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev()
}
