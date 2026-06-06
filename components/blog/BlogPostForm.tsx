'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BlogEditor from '@/components/blog/BlogEditor'
import BlogArticleBody from '@/components/blog/BlogArticleBody'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import BlogMediaUpload from '@/components/blog/BlogMediaUpload'
import { slugify } from '@/lib/format'
import { excerptFromContent } from '@/lib/blog/content'

export type BlogPostFormValues = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  metaTitle: string
  metaDescription: string
  coverImageUrl: string
  status: 'DRAFT' | 'PUBLISHED'
}

type BlogPostFormProps = {
  initial?: Partial<BlogPostFormValues>
  mode: 'create' | 'edit'
}

export default function BlogPostForm({ initial, mode }: BlogPostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug))
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? '')
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? '')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(initial?.status ?? 'DRAFT')
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title))
    }
  }, [title, slugTouched])

  const wordCount = useMemo(
    () => content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
    [content]
  )

  const save = async (nextStatus: 'DRAFT' | 'PUBLISHED') => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    const payload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      excerpt: excerpt.trim() || excerptFromContent(content),
      content,
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || excerpt.trim() || excerptFromContent(content),
      coverImageUrl: coverImageUrl.trim() || null,
      status: nextStatus,
    }

    if (!payload.title) {
      setError('Title is required.')
      setSaving(false)
      return
    }

    try {
      const url = mode === 'create' ? '/api/blog' : `/api/blog/manage/${initial?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed to save post')
        return
      }

      setStatus(nextStatus)
      setSuccess(nextStatus === 'PUBLISHED' ? 'Published successfully.' : 'Draft saved.')
      if (mode === 'create' && data.id) {
        router.replace(`/dashboard/articles/${data.id}/edit`)
      } else {
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const unpublish = async () => {
    if (!initial?.id) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/blog/manage/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'DRAFT' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to unpublish')
        return
      }
      setStatus('DRAFT')
      setSuccess('Moved back to drafts.')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!initial?.id) return
    if (!window.confirm('Delete this article? This cannot be undone.')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/blog/manage/${initial.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to delete')
        return
      }
      router.push('/dashboard/articles')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/articles" className="text-sm text-purple-600 hover:underline">
            ← All articles
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-50 mt-2">
            {mode === 'create' ? 'New article' : 'Edit article'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === 'PUBLISHED' ? 'success' : 'warning'}>
            {status === 'PUBLISHED' ? 'Published' : 'Draft'}
          </Badge>
          <span className="text-sm text-gray-500">{wordCount} words</span>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <div className="grid gap-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A calm guide for guardians…"
          disabled={saving}
        />
        <Input
          label="URL slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true)
            setSlug(e.target.value)
          }}
          placeholder="a-calm-guide-for-guardians"
          disabled={saving}
        />
        <Textarea
          label="Excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="One sentence summary for cards and search."
          rows={2}
          disabled={saving}
        />
        <BlogMediaUpload
          label="Cover image"
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          disabled={saving}
          hint="Shows at the top of the article. Upload or paste an image URL."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">Article body</p>
          <button
            type="button"
            className="text-sm text-purple-600 hover:underline"
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? 'Back to editor' : 'Preview'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          Use the toolbar to upload images, add links, or embed YouTube/Vimeo videos inline.
        </p>
        {preview ? (
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <BlogArticleBody content={content || '<p>Nothing to preview yet.</p>'} />
          </div>
        ) : (
          <BlogEditor value={content} onChange={setContent} disabled={saving} />
        )}
      </div>

      <details className="rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-zinc-50">
          SEO settings
        </summary>
        <div className="mt-4 grid gap-4">
          <Input
            label="Meta title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            disabled={saving}
          />
          <Textarea
            label="Meta description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            disabled={saving}
          />
        </div>
      </details>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          isLoading={saving}
          disabled={saving}
          onClick={() => save('DRAFT')}
        >
          Save draft
        </Button>
        <Button
          type="button"
          variant="primary"
          isLoading={saving}
          disabled={saving}
          onClick={() => save('PUBLISHED')}
        >
          {status === 'PUBLISHED' ? 'Update & publish' : 'Publish'}
        </Button>
        {mode === 'edit' && status === 'PUBLISHED' && (
          <Button type="button" variant="ghost" disabled={saving} onClick={unpublish}>
            Unpublish
          </Button>
        )}
        {mode === 'edit' && (
          <Button type="button" variant="destructive" disabled={saving} onClick={remove}>
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
