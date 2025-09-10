"use client"

import { useMemo } from 'react'
import { Prefs } from '@/lib/types'

const GENRES = ['Fantasy','Sci-Fi','Mystery','Thriller','Romance','Non-fiction','History','Biography','Self-help','Business']

export default function Preferences({ value, onChange }: { value: Prefs, onChange: (v: Prefs) => void }) {
  const selected = useMemo(() => new Set(value.genres), [value.genres])

  const toggle = (g: string) => {
    const next = new Set(selected)
    if (next.has(g)) next.delete(g); else next.add(g)
    onChange({ ...value, genres: Array.from(next) })
  }

  return (
    <div className="card space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {GENRES.map(g => {
          const isActive = selected.has(g)
          return (
            <button
              type="button"
              key={g}
              onClick={() => toggle(g)}
              className={`px-3 py-2 rounded-pixel border text-sm transition-colors ${isActive ? 'bg-brand-600 text-white border-brand-700' : 'bg-white/70 hover:bg-neutral-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-800'}`}
            >
              {g}
            </button>
          )
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="opacity-80">Favorite authors (comma-separated)</span>
          <input
            value={value.favoriteAuthors}
            onChange={e => onChange({ ...value, favoriteAuthors: e.target.value })}
            placeholder="e.g., Tolkien, Brandon Sanderson"
            className="mt-1 w-full border rounded-pixel px-3 py-2 bg-white/90 dark:bg-neutral-900/80"
          />
        </label>
        <label className="block text-sm">
          <span className="opacity-80">Reading mood / notes</span>
          <input
            value={value.notes}
            onChange={e => onChange({ ...value, notes: e.target.value })}
            placeholder="cozy, epic, character-driven, fast-paced..."
            className="mt-1 w-full border rounded-pixel px-3 py-2 bg-white/90 dark:bg-neutral-900/80"
          />
        </label>
      </div>
    </div>
  )
}
