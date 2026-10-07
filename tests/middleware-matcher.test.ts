import { describe, expect, it, vi } from 'vitest'

vi.mock('next-auth', () => ({ default: () => ({ auth: (fn: unknown) => fn }) }))
vi.mock('@/auth.config', () => ({ default: {} }))
vi.mock('@/lib/sites', () => ({ handleSiteRouting: () => null }))

import { config } from '@/middleware'

// Next anchors matcher sources as a full-path regex.
const re = new RegExp(`^${config.matcher[0]}$`)

describe('middleware matcher', () => {
  it.each([
    '/',
    '/learning',
    '/learning/letter-sounds/quiz',
    '/dashboard/admin',
    '/api/learning/say-it/celebrate',
    '/shop/some-product',
  ])('runs on %s', (path) => expect(re.test(path)).toBe(true))

  it.each([
    '/_next/static/chunks/app.js',
    '/favicon.ico',
    '/api/media/avatars/a.png',
    '/eco-penguin-sw.js',
    '/say-it/audio/cat.mp3',
    '/write-it/letters/a.webp',
    '/future-activity/clip.wav',
    '/sight-words/data.json',
  ])('skips %s', (path) => expect(re.test(path)).toBe(false))
})
