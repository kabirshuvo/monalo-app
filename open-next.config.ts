import { defineCloudflareConfig } from '@opennextjs/cloudflare'

/**
 * Default Cloudflare config (Node.js compat runtime).
 * Uncomment the R2 incremental cache override after adding NEXT_INC_CACHE_R2_BUCKET to wrangler.jsonc.
 */
export default defineCloudflareConfig({
  // incrementalCache: (await import('@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache')).default,
})
