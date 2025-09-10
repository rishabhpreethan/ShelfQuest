import { NextResponse } from 'next/server'
import { searchGoogleBooksByTitle } from '@/lib/googleBooks'
import { searchOpenLibraryByTitle } from '@/lib/openLibrary'
import { BookMetadata } from '@/lib/types'
import { GEMINI_API_KEY } from '@/lib/config'
import { summarizeAndReason, textModel } from '@/lib/gemini'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
const requests = new Map<string, number[]>()

function rateLimit(ip: string) {
  const now = Date.now()
  const arr = (requests.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  arr.push(now)
  requests.set(ip, arr)
  return arr.length <= RATE_LIMIT_MAX
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim()
  if (!rateLimit(ip)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const titles: string[] = Array.isArray(body.titles) ? body.titles.slice(0, 30) : []
    if (!titles.length) return NextResponse.json({ books: [] })

    const results: BookMetadata[] = []

    for (const title of titles) {
      let meta = await searchGoogleBooksByTitle(title)
      if (!meta) meta = await searchOpenLibraryByTitle(title)
      if (meta) results.push(meta)
    }

    // Optional: fill missing summary/rating with Gemini (budget-friendly: combine few at a time)
    if (GEMINI_API_KEY) {
      try {
        const missing = results.filter(b => !b.summary).slice(0, 10) // cap
        if (missing.length) {
          const model = textModel()
          const prompt = `Provide a 2-sentence, spoiler-light blurb for each book. Return JSON array with {id, summary}.\nBooks: ${JSON.stringify(missing.map(m => ({ id: m.id, title: m.title, authors: m.authors })))} `
          const r = await model.generateContent([{ text: prompt }])
          const txt = r.response.text()
          const start = txt.indexOf('[')
          if (start >= 0) {
            const arr = JSON.parse(txt.slice(start)) as { id: string, summary: string }[]
            const byId = new Map(arr.map(x => [x.id, x.summary]))
            for (const b of results) {
              if (!b.summary && byId.has(b.id)) b.summary = byId.get(b.id)
            }
          }
        }
      } catch (e) {
        // ignore fill errors
      }
    }

    // De-dupe by normalized title+authors
    const seen = new Set<string>()
    const deduped: BookMetadata[] = []
    for (const b of results) {
      const key = `${b.title?.toLowerCase() || ''}|${(b.authors||[]).join(',').toLowerCase()}`
      if (key.trim() && !seen.has(key)) { seen.add(key); deduped.push(b) }
    }

    return NextResponse.json({ books: deduped })
  } catch (e) {
    console.error('metadata error', e)
    return NextResponse.json({ error: 'Failed to fetch book metadata' }, { status: 500 })
  }
}
