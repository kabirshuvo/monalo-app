'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { useEffect, useRef, useState } from 'react'
import { parseVideoEmbed } from '@/lib/blog/media'
import { videoEmbedHtml } from '@/lib/blog/sanitize'

type BlogEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        'rounded-md px-2 py-1 text-sm font-medium transition-colors',
        active
          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
          : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default function BlogEditor({
  value,
  onChange,
  placeholder = 'Write for guardians and kids — calm, clear, and helpful.',
  disabled = false,
}: BlogEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'blog-inline-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'text-purple-700 dark:text-purple-300 underline',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        modestBranding: true,
        HTMLAttributes: {
          class: 'blog-video-embed',
        },
      }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[280px] px-4 py-3 focus:outline-none prose prose-neutral dark:prose-invert max-w-none blog-editor-body',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current && value !== editor.getText()) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [editor, value])

  const insertImageUrl = () => {
    if (!editor) return
    const url = window.prompt('Image URL (https://…)')
    if (!url?.trim()) return
    editor.chain().focus().setImage({ src: url.trim(), alt: '' }).run()
  }

  const insertImageUpload = async (file: File) => {
    if (!editor) return
    setUploading(true)
    setMediaError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'blog')
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMediaError(data.error || 'Image upload failed')
        return
      }
      editor.chain().focus().setImage({ src: data.url, alt: '' }).run()
    } catch {
      setMediaError('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const insertLink = () => {
    if (!editor) return
    const url = window.prompt('Link URL (https://…)')
    if (!url?.trim()) return
    const href = url.trim()
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${href}">${href}</a>`).run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    }
  }

  const insertVideo = () => {
    if (!editor) return
    const url = window.prompt('YouTube or Vimeo URL')
    if (!url?.trim()) return
    const embed = parseVideoEmbed(url.trim())
    if (!embed) {
      setMediaError('Use a YouTube or Vimeo link.')
      return
    }
    if (embed.provider === 'youtube') {
      editor.commands.setYoutubeVideo({ src: embed.embedSrc })
    } else {
      editor.chain().focus().insertContent(videoEmbedHtml('vimeo', embed.videoId)).run()
    }
  }

  if (!editor) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-sm text-gray-500">
        Loading editor…
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 px-2 py-2">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          “
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-gray-200 dark:bg-zinc-700" aria-hidden />
        <ToolbarButton label="Insert image URL" onClick={insertImageUrl}>
          Image URL
        </ToolbarButton>
        <ToolbarButton label="Upload image" onClick={() => fileInputRef.current?.click()}>
          {uploading ? 'Uploading…' : 'Upload image'}
        </ToolbarButton>
        <ToolbarButton label="Insert link" onClick={insertLink}>
          Link
        </ToolbarButton>
        <ToolbarButton label="Embed video" onClick={insertVideo}>
          Video
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-gray-200 dark:bg-zinc-700" aria-hidden />
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          ↩
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          ↪
        </ToolbarButton>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) insertImageUpload(file)
          e.target.value = ''
        }}
      />
      {mediaError && (
        <p className="px-3 py-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30">{mediaError}</p>
      )}
      {!editor.getText().trim() && (
        <p className="pointer-events-none absolute mt-14 px-4 text-sm text-gray-400">{placeholder}</p>
      )}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
