import { BookMetadata } from './types'
import { GOOGLE_BOOKS_API_KEY, AMAZON_AFFILIATE_TAG } from './config'

export async function searchGoogleBooksByTitle(title: string): Promise<BookMetadata | null> {
  const q = encodeURIComponent(`intitle:${title}`)
  const key = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : ''
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}${key}&maxResults=1`
  const r = await fetch(url)
  if (!r.ok) return null
  const j = await r.json()
  const item = j.items?.[0]
  if (!item) return null
  const v = item.volumeInfo || {}
  const isbn13 = (v.industryIdentifiers || []).find((x: any) => x.type === 'ISBN_13')?.identifier
  const amazonAffiliate = isbn13 && AMAZON_AFFILIATE_TAG ? `https://www.amazon.com/dp/${isbn13}/?tag=${AMAZON_AFFILIATE_TAG}` : undefined
  return {
    id: item.id,
    title: v.title,
    authors: v.authors || [],
    thumbnail: v.imageLinks?.thumbnail?.replace('http://', 'https://'),
    infoLink: v.infoLink,
    previewLink: v.previewLink,
    isbn13,
    summary: v.description,
    amazonAffiliate,
  }
}
