'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Alert from '@/components/ui/Alert'
import ImageUpload from '@/components/ui/ImageUpload'
import Select from '@/components/ui/Select'
import type { ProductStatus } from '@prisma/client'
import {
  SHOP_CATEGORY_SELECT_OPTIONS,
  type ShopCategoryId,
} from '@/lib/shop/categories'

type ProductFormProps = {
  mode: 'create' | 'edit'
  slug?: string
  initial?: {
    name: string
    description: string | null
    price: number
    stock: number
    imageUrl: string | null
    status: ProductStatus
    category: ShopCategoryId
  }
}

export default function ProductForm({ mode, slug, initial }: ProductFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priceDollars, setPriceDollars] = useState(
    initial ? (initial.price / 100).toFixed(2) : ''
  )
  const [stock, setStock] = useState(String(initial?.stock ?? 10))
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? 'ACTIVE')
  const [category, setCategory] = useState<ShopCategoryId>(initial?.category ?? 'OTHER_CRAFT')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const price = Math.round(parseFloat(priceDollars) * 100)
    if (!name.trim() || !Number.isFinite(price) || price < 0) {
      setError('Enter a name and valid price.')
      setLoading(false)
      return
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      price,
      stock: parseInt(stock, 10) || 0,
      imageUrl: imageUrl.trim() || undefined,
      status,
      category,
    }

    try {
      const url = mode === 'edit' && slug ? `/api/products/${slug}` : '/api/products'
      const method = mode === 'edit' ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save product')
        return
      }
      setSuccess(mode === 'edit' ? 'Product updated' : `Created “${data.name}”`)
      if (mode === 'create') {
        setName('')
        setDescription('')
        setPriceDollars('')
        setStock('10')
        setImageUrl('')
        setStatus('ACTIVE')
        setCategory('OTHER_CRAFT')
      }
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {mode === 'edit' ? 'Edit product' : 'Add product'}
      </h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <Select
        label="Craft category"
        value={category}
        onChange={(e) => setCategory(e.target.value as ShopCategoryId)}
        options={SHOP_CATEGORY_SELECT_OPTIONS}
        helperText="Choose the shelf this item belongs on in the MonAlo craft shop."
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (USD)"
          type="number"
          step="0.01"
          min="0"
          value={priceDollars}
          onChange={(e) => setPriceDollars(e.target.value)}
          required
        />
        <Input
          label="Stock"
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>
      {mode === 'edit' && (
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
          options={[
            { value: 'ACTIVE', label: 'Active (visible in shop)' },
            { value: 'INACTIVE', label: 'Hidden' },
            { value: 'DISCONTINUED', label: 'Discontinued' },
          ]}
        />
      )}
      <ImageUpload label="Product image" folder="shop" value={imageUrl} onChange={setImageUrl} />
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create product'}
      </Button>
    </form>
  )
}
