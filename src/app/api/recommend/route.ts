import { NextResponse } from 'next/server'
import { summarizeAndReason } from '@/lib/gemini'

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
    const body = await req.json().catch(() => ({}))
    const extracted = body.extracted || { titles: [], authors: [] }
    const prefs = body.prefs || { genres: [], favoriteAuthors: '', notes: '' }
    const metadata = body.metadata || { books: [] }

    const ai = await summarizeAndReason({ extracted, prefs, books: metadata.books })

    // Normalize summary to bullets if not already
    let summary: string = ai?.summary || ''
    if (summary && !summary.includes('\n-')) {
      summary = summary.split('\n').map(s => s.trim()).filter(Boolean).map(s => `- ${s}`).join('\n')
    }

    const reasons = ai?.reasons || {}
    return NextResponse.json({ summary, reasons })
  } catch (e) {
    console.error('recommend error', e)
    return NextResponse.json({ summary: 'AI unavailable. Showing matched titles from metadata only.', reasons: {} })
  }
}
