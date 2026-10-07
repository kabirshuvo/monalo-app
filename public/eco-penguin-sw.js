/* Eco Penguin offline media cache — same-origin audio/images for unlocked packs. */
const CACHE_NAME = 'eco-penguin-media-v1'
const MEDIA_PREFIXES = [
  '/consonant-blends/',
  '/nursery-rhyme/',
  '/say-it/',
  '/sight-words/',
  '/write-it/',
  '/letter-sounds/',
  '/vowel-words/',
  '/digraphs/',
  '/ecopenguin/',
  '/balloon-letters/',
]

function isMediaPath(pathname) {
  return MEDIA_PREFIXES.some((p) => pathname.startsWith(p))
}

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE_NAME))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  let url
  try {
    url = new URL(req.url)
  } catch {
    return
  }
  if (url.origin !== self.location.origin) return
  if (!isMediaPath(url.pathname)) return

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req)
      if (cached) return cached
      try {
        const res = await fetch(req)
        if (res.ok) {
          cache.put(req, res.clone())
        }
        return res
      } catch (err) {
        if (cached) return cached
        throw err
      }
    })
  )
})
