import { NextResponse } from 'next/server'
import { ocrFromImage } from '@/lib/gemini'
import { GEMINI_API_KEY } from '@/lib/config'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const requests = new Map<string, number[]>()

function rateLimit(ip: string) {
  const now = Date.now()
  const arr = (requests.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  arr.push(now)
  requests.set(ip, arr)
  return arr.length <= RATE_LIMIT_MAX
}

export async function POST(req: Request) {
  // Rate limit
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim()
  if (!rateLimit(ip)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const ct = req.headers.get('content-type') || ''
  if (!ct.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data with field "image"' }, { status: 400 })
  }
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  try {
    const form = await req.formData()
    const file = form.get('image') as File | null
    if (!file) return NextResponse.json({ error: 'Missing image' }, { status: 400 })
    const bytes = new Uint8Array(await file.arrayBuffer())

    const { titles, authors } = await ocrFromImage(bytes, file.type || 'image/jpeg')

    // Post-cleaning
    const cleanedTitles = Array.from(new Set(titles.map(t => t.replace(/\s+/g, ' ').trim()))).slice(0, 50)
    const cleanedAuthors = Array.from(new Set(authors.map(a => a.replace(/\s+/g, ' ').trim()))).slice(0, 50)

    return NextResponse.json({ titles: cleanedTitles, authors: cleanedAuthors })
  } catch (e: any) {
    console.error('OCR error', e)
    return NextResponse.json({ error: 'OCR failed. Try again later.' }, { status: 500 })
  }
}
