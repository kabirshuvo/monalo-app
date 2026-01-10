import React from 'react'

export default function PostCard({ title }: { title: string }) {
  return (
    <article>
      <h3>{title}</h3>
    </article>
  )
}
