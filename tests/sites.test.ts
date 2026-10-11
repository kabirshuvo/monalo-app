import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
  ecoPenguinCanonicalRedirect,
  resolveRoutedPathname,
  handleSiteRouting,
} from '@/lib/sites'

const req = (url: string, init: { method?: string } = {}) => {
  const u = new URL(url)
  return new NextRequest(url, { method: init.method, headers: { host: u.host } })
}

afterEach(() => vi.unstubAllEnvs())

describe('ecopenguin subdomain routing', () => {
  it('maps bare paths onto /learning for auth gating and rewriting', () => {
    expect(resolveRoutedPathname(req('https://ecopenguin.monalo.school/'))).toBe('/learning')
    expect(resolveRoutedPathname(req('https://ecopenguin.monalo.school/digraphs'))).toBe(
      '/learning/digraphs'
    )
    expect(resolveRoutedPathname(req('https://ecopenguin.monalo.school/learning/x'))).toBe(
      '/learning/x'
    )
  })

  it('passes shared pages through unchanged', () => {
    for (const p of ['/login', '/classroom', '/profile', '/settings', '/api/auth/session']) {
      expect(resolveRoutedPathname(req(`https://ecopenguin.monalo.school${p}`))).toBe(p)
    }
  })

  it('rewrites the subdomain root to the learning hub', () => {
    const res = handleSiteRouting(req('https://ecopenguin.monalo.school/sight-words'))
    expect(res?.headers.get('x-middleware-rewrite')).toContain('/learning/sight-words')
  })

  it('keeps the rewrite on the request host so it stays an internal rewrite', () => {
    const res = handleSiteRouting(req('https://ecopenguin.monalo.school/sight-words?x=1'))
    const target = new URL(res!.headers.get('x-middleware-rewrite')!)
    expect(target.host).toBe('ecopenguin.monalo.school')
    expect(target.pathname).toBe('/learning/sight-words')
    expect(target.search).toBe('?x=1')
  })

  it('does not touch the main host', () => {
    expect(resolveRoutedPathname(req('https://monalo.school/learning/digraphs'))).toBe(
      '/learning/digraphs'
    )
  })
})

describe('ecoPenguinCanonicalRedirect', () => {
  it('does nothing until NEXT_PUBLIC_ECOPENGUIN_URL is set', () => {
    expect(ecoPenguinCanonicalRedirect(req('https://monalo.school/learning/digraphs'))).toBeNull()
  })

  it('moves /learning on the main host to the Eco Penguin origin, keeping the query', () => {
    vi.stubEnv('NEXT_PUBLIC_ECOPENGUIN_URL', 'https://ecopenguin.monalo.school/')
    const res = ecoPenguinCanonicalRedirect(req('https://monalo.school/learning/digraphs?a=1'))
    expect(res?.status).toBe(307)
    expect(res?.headers.get('location')).toBe('https://ecopenguin.monalo.school/digraphs?a=1')
    expect(
      ecoPenguinCanonicalRedirect(req('https://monalo.school/learning'))?.headers.get('location')
    ).toBe('https://ecopenguin.monalo.school/')
  })

  it('strips the /learning prefix on the subdomain itself', () => {
    vi.stubEnv('NEXT_PUBLIC_ECOPENGUIN_URL', 'https://ecopenguin.monalo.school')
    const res = ecoPenguinCanonicalRedirect(req('https://ecopenguin.monalo.school/learning/say-it'))
    expect(res?.headers.get('location')).toBe('https://ecopenguin.monalo.school/say-it')
  })

  it('leaves non-learning paths, API calls, POSTs and other hosts alone', () => {
    vi.stubEnv('NEXT_PUBLIC_ECOPENGUIN_URL', 'https://ecopenguin.monalo.school')
    expect(ecoPenguinCanonicalRedirect(req('https://monalo.school/shop'))).toBeNull()
    expect(ecoPenguinCanonicalRedirect(req('https://monalo.school/api/learning/x/celebrate'))).toBeNull()
    expect(
      ecoPenguinCanonicalRedirect(req('https://monalo.school/learning/x', { method: 'POST' }))
    ).toBeNull()
    expect(ecoPenguinCanonicalRedirect(req('http://localhost:3000/learning/x'))).toBeNull()
  })
})
