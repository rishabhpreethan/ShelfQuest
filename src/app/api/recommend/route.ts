import { NextResponse } from 'next/server'
import { summarizeAndReason } from '@/lib/gemini'
import type { BookMetadata, Prefs } from '@/lib/types'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 15
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
    const body = await req.json().catch(() => ({})) as {
      extracted?: { titles: string[]; authors: string[] }
      prefs?: Prefs
      metadata?: { books: BookMetadata[] }
      alreadyReadTitles?: string[]
    }
    const extracted = body.extracted || { titles: [], authors: [] }
    const prefs: Prefs = body.prefs || { genres: [], favoriteAuthors: '', notes: '' }
    const metadata = body.metadata || { books: [] }
    const alreadyRead = new Set((body.alreadyReadTitles || []).map(t => (t || '').toLowerCase()))

    // 1) Deterministic scoring per provided rubric
    const prefGenres = new Set((prefs.genres || []).map(g => g.toLowerCase()))
    const favoriteAuthors = (prefs.favoriteAuthors || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

    const RELATED: Record<string, string[]> = {
      'fantasy': ['sci-fi', 'science fiction', 'adventure'],
      'sci-fi': ['science fiction', 'fantasy'],
      'science fiction': ['sci-fi', 'fantasy'],
      'mystery': ['thriller', 'crime'],
      'thriller': ['mystery', 'crime'],
      'biography': ['non-fiction', 'nonfiction', 'memoir'],
      'non-fiction': ['biography', 'nonfiction', 'memoir'],
      'nonfiction': ['biography', 'non-fiction', 'memoir'],
      'memoir': ['biography', 'non-fiction', 'nonfiction'],
    }

    const reasons: Record<string, string> = {}
    const scores: Record<string, number> = {}

    for (const b of (metadata.books as BookMetadata[])) {
      const id = b.id
      const title = (b.title || '').toLowerCase()
      const bookGenres = (b.genres || []).map(g => g.toLowerCase())
      const bookAuthors = (b.authors || []).map(a => a.toLowerCase())

      // A. Genre match (0–3)
      let genreMatch = 0
      const hasExact = bookGenres.some(g => prefGenres.has(g))
      if (hasExact) genreMatch = 3
      else {
        const hasRelated = bookGenres.some(g => (RELATED[g] || []).some(r => prefGenres.has(r)))
        if (hasRelated) genreMatch = 2
      }

      // B. Author match (0–3)
      let authorMatch = 0
      const hasFav = bookAuthors.some(a => favoriteAuthors.includes(a))
      if (hasFav) authorMatch = 3
      // Optional: simple partial match heuristic for similar authors
      else {
        const favLastNames = favoriteAuthors.map(a => a.split(' ').slice(-1)[0]).filter(Boolean)
        const bookLastNames = bookAuthors.map(a => a.split(' ').slice(-1)[0])
        const similar = favLastNames.length && bookLastNames.some(ln => favLastNames.includes(ln))
        if (similar) authorMatch = 2
      }

      // C. Popularity / Rating (0–2)
      let ratingMatch = 0
      const r = typeof b.rating === 'number' ? b.rating : undefined
      if (r !== undefined) {
        if (r >= 4.0) ratingMatch = 2
        else if (r >= 3.5) ratingMatch = 1
      }

      // D. Novelty (0–2) — +2 if not in alreadyRead list
      let novelty = 0
      if (!alreadyRead.size) {
        novelty = 2 // default to novel if no data
      } else {
        novelty = alreadyRead.has(title) ? 0 : 2
      }

      const total = genreMatch + authorMatch + ratingMatch + novelty
      scores[id] = total

      const why: string[] = []
      if (genreMatch === 3) why.push('Exact genre match')
      else if (genreMatch === 2) why.push('Related genre match')
      if (authorMatch === 3) why.push('Favorite author')
      else if (authorMatch === 2) why.push('Similar author')
      if (ratingMatch === 2) why.push('Highly rated (≥4.0)')
      else if (ratingMatch === 1) why.push('Moderately rated (3.5–4.0)')
      if (novelty === 2) why.push('New to you')
      reasons[id] = why.join(' • ')
    }

    // order by score desc, then rating desc, then title
    const order = (metadata.books as BookMetadata[])
      .map(b => ({ id: b.id, score: scores[b.id] ?? 0, rating: b.rating ?? 0, title: b.title || '' }))
      .sort((a, b) => (b.score - a.score) || (b.rating - a.rating) || a.title.localeCompare(b.title))
      .map(x => x.id)

    // Try to get an AI-written summary/explanation, but fall back to deterministic reasons
    let summary = ''
    try {
      const ai = await summarizeAndReason({ extracted, prefs, books: metadata.books })
      summary = ai?.summary || ''
      if (summary && !summary.includes('\n-')) {
        summary = summary.split('\n').map(s => s.trim()).filter(Boolean).map(s => `- ${s}`).join('\n')
      }
    } catch (_) {
      // ignore AI summary errors
    }

    return NextResponse.json({ summary, reasons, order, scores })
  } catch (e) {
    console.error('recommend error', e)
    return NextResponse.json({ summary: 'AI unavailable. Showing matched titles from metadata only.', reasons: {} })
  }
}
