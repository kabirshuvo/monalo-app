import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.fn()
const revalidatePathMock = vi.fn()

vi.mock('@/lib/auth-server', () => ({ auth: () => authMock() }))
vi.mock('next/cache', () => ({ revalidatePath: (p: string) => revalidatePathMock(p) }))
vi.mock('@/lib/classroom/celebrate-scope', () => ({
  resolveLearnerScope: async () => ({ learnerProfileId: 'kid-1' }),
}))
vi.mock('@/lib/points/service', () => ({
  getPointsBreakdown: async () => ({ total: 7 }),
}))

import { bodyString, celebrateError, createCelebrateHandler } from '@/lib/learning/celebrate-handler'

const post = (body: unknown) =>
  new Request('http://test/api/learning/x/celebrate', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('createCelebrateHandler', () => {
  beforeEach(() => {
    authMock.mockReset()
    revalidatePathMock.mockReset()
  })

  it('returns 401 when signed out', async () => {
    authMock.mockResolvedValue(null)
    const POST = createCelebrateHandler('x', async () => ({
      result: { awarded: true, points: 1 },
      revalidate: [],
    }))
    const res = await POST(post({}))
    expect(res.status).toBe(401)
  })

  it('returns a guest payload when allowGuest is set', async () => {
    authMock.mockResolvedValue(null)
    const run = vi.fn()
    const POST = createCelebrateHandler('x', run, { allowGuest: true })
    const res = await POST(post({}))
    expect(await res.json()).toEqual({ ok: true, awarded: false, guest: true, points: 0 })
    expect(run).not.toHaveBeenCalled()
  })

  it('passes scope and trimmed body to run, then awards, revalidates and responds', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } })
    const run = vi.fn(async ({ userId, scope, body }) => {
      expect(userId).toBe('u1')
      expect(scope).toEqual({ learnerProfileId: 'kid-1' })
      expect(bodyString(body, 'wordId')).toBe('cat')
      return { result: { awarded: true, points: 5 }, revalidate: ['/a', '/a/b'] }
    })
    const res = await createCelebrateHandler('x', run)(post({ wordId: '  cat ' }))
    expect(await res.json()).toEqual({
      ok: true,
      awarded: true,
      points: 5,
      alreadyMastered: false,
      breakdown: { total: 7 },
    })
    expect(revalidatePathMock.mock.calls.map((c) => c[0])).toEqual(['/a', '/a/b'])
  })

  it('flags alreadyMastered when nothing was awarded', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } })
    const POST = createCelebrateHandler('x', async () => ({
      result: { awarded: false, points: 0 },
      revalidate: [],
    }))
    const body = await (await POST(post({}))).json()
    expect(body.alreadyMastered).toBe(true)
  })

  it('passes through an early error response without awarding', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } })
    const POST = createCelebrateHandler('x', async () => celebrateError('Word not found', 404))
    const res = await POST(post({}))
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Word not found' })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('treats malformed or non-object JSON as an empty body', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } })
    const seen: unknown[] = []
    const POST = createCelebrateHandler('x', async ({ body }) => {
      seen.push(body)
      return { result: { awarded: true, points: 1 }, revalidate: [] }
    })
    await POST(post('not json'))
    await POST(post('null'))
    expect(seen).toEqual([{}, {}])
  })

  it('returns 500 when run throws', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const POST = createCelebrateHandler('x', async () => {
      throw new Error('db down')
    })
    const res = await POST(post({}))
    expect(res.status).toBe(500)
    spy.mockRestore()
  })
})
