import { Prefs } from './types'

const PREFS_KEY = 'bookscout:prefs'

export function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return { genres: [], favoriteAuthors: '', notes: '' }
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { genres: [], favoriteAuthors: '', notes: '' }
    return JSON.parse(raw)
  } catch {
    return { genres: [], favoriteAuthors: '', notes: '' }
  }
}

export function savePrefs(p: Prefs) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREFS_KEY, JSON.stringify(p))
}
