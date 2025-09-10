import { BookMetadata } from './types'
import { AMAZON_AFFILIATE_TAG } from './config'

export async function searchOpenLibraryByTitle(title: string): Promise<BookMetadata | null> {
  const q = encodeURIComponent(title)
  const url = `https://openlibrary.org/search.json?title=${q}&limit=1`
  const r = await fetch(url)
  if (!r.ok) return null
  const j = await r.json()
  const d = j.docs?.[0]
  if (!d) return null
  const isbn13 = d.isbn?.find((x: string) => x.length === 13)
  const cover = d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : undefined
  const amazonAffiliate = isbn13 && AMAZON_AFFILIATE_TAG ? `https://www.amazon.com/dp/${isbn13}/?tag=${AMAZON_AFFILIATE_TAG}` : undefined
  return {
    id: `ol-${d.key}`,
    title: d.title,
    authors: d.author_name || [],
    thumbnail: cover,
    infoLink: d.key ? `https://openlibrary.org${d.key}` : undefined,
    previewLink: undefined,
    isbn13,
    summary: d.first_sentence?.[0],
    amazonAffiliate,
  }
}
