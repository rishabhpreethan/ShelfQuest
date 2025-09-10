import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_API_KEY } from './config'

if (!GEMINI_API_KEY) {
  // Let routes handle the error gracefully; no throw here to allow app to boot
}

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export function textModel() {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

function stripCodeFences(s: string) {
  // Remove ```json ... ``` or ``` ... ``` fences
  const fenced = s.match(/```(?:json)?\n([\s\S]*?)```/i)
  if (fenced && fenced[1]) return fenced[1].trim()
  return s.trim()
}

function extractJSONObject(text: string): any {
  const cleaned = stripCodeFences(text)
  // Try to find the first '{' and the matching last '}'
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    const candidate = cleaned.slice(first, last + 1)
    try { return JSON.parse(candidate) } catch {}
  }
  // Fallback: try to eval a safer JSON by removing trailing commas
  try {
    const relaxed = cleaned
      .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
    const f = relaxed.indexOf('{')
    const l = relaxed.lastIndexOf('}')
    if (f !== -1 && l !== -1 && l > f) {
      return JSON.parse(relaxed.slice(f, l + 1))
    }
  } catch {}
  throw new Error('Failed to parse JSON from model output')
}

export async function ocrFromImage(bytes: Uint8Array, mimeType: string) {
  const model = textModel()
  const prompt = `You are an OCR assistant for bookshelf photos. Extract plausible book titles and optional authors.
  Return only JSON with shape: {"titles": string[], "authors": string[]}. Titles should be deduplicated, trimmed.`
  const res = await model.generateContent([
    { text: prompt },
    { inlineData: { data: Buffer.from(bytes).toString('base64'), mimeType } as any },
  ])
  const out = res.response.text()
  try {
    const json = extractJSONObject(out)
    return { titles: Array.from(new Set((json.titles||[]).map((s:string)=>s.trim()))), authors: Array.from(new Set((json.authors||[]).map((s:string)=>s.trim()))) }
  } catch {
    // naive fallback: extract Capitalized phrases
    const text = out.replace(/\n/g, ' ')
    const matches = text.match(/([A-Z][A-Za-z0-9'’:&-]+(?:\s+[A-Z][A-Za-z0-9'’:&-]+){0,6})/g) || []
    const titles = Array.from(new Set(matches.map(s=>s.trim()).filter(s=>s.split(' ').length>=2))).slice(0,50)
    return { titles, authors: [] as string[] }
  }
}

export async function summarizeAndReason(payload: any) {
  const model = textModel()
  const prompt = `Given extracted shelf titles, user preferences, and matched book metadata, produce:
- summary: 3-6 bullet points concise.
- reasons: a mapping from book id to a one-sentence reason (<=25 words) why it matches.
Keep it helpful and specific. Return only JSON {"summary": string, "reasons": Record<string,string>}.`
  const res = await model.generateContent([{ text: prompt + "\n\nDATA:\n" + JSON.stringify(payload) }])
  const out = res.response.text()
  try {
    return extractJSONObject(out)
  } catch {
    return { summary: 'AI unavailable. Showing matched titles from metadata only.', reasons: {} }
  }
}
