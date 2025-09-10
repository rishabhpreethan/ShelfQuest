"use client"

import { useState } from 'react'

export default function Upload({ onExtracted }: { onExtracted: (v: { titles: string[], authors: string[] }) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const onUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    const fd = new FormData()
    fd.append('image', file)

    try {
      const res = await fetch('/api/ocr', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'OCR failed')
      onExtracted({ titles: data.titles || [], authors: data.authors || [] })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    if (e.type === 'dragleave') setDragActive(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) {
      setFile(f)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(f))
    }
  }

  return (
    <div className="card space-y-4">
      <div
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        className={`rounded-pixel border-2 border-dashed p-6 text-center transition-colors ${dragActive ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-900/20' : 'border-neutral-300 dark:border-neutral-700'}`}
      >
        <p className="text-sm opacity-80 mb-2">Drag & drop a bookshelf photo here</p>
        <p className="text-xs opacity-60 mb-3">or</p>
        <label className="inline-block cursor-pointer btn-secondary">
          <input type="file" accept="image/*" onChange={onChange} className="hidden" />
          Choose Image
        </label>
        {preview && (
          <div className="mt-4 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" className="max-h-40 rounded-pixel border" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button disabled={!file || loading} onClick={onUpload} className="btn">
          {loading ? 'Scanning…' : 'Scan Shelf Photo'}
        </button>
        {file && <span className="text-xs opacity-70 truncate max-w-[50%]">{file.name}</span>}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
