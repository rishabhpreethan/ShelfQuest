export type Prefs = {
  genres: string[]
  favoriteAuthors: string
  notes: string
}

export type BookMetadata = {
  id: string
  title: string
  authors: string[]
  thumbnail?: string
  infoLink?: string
  previewLink?: string
  isbn13?: string
  summary?: string
  rating?: number
  amazonAffiliate?: string
  genres?: string[]
}
