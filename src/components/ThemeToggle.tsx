"use client"

import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Now safe to access window/localStorage
    const saved = typeof window !== 'undefined' ? localStorage.getItem('shelfquest:theme') : null
    const prefersDark = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    const next = saved === 'light' || saved === 'dark' ? saved : (prefersDark ? 'dark' : 'light')
    setTheme(next)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const html = document.documentElement
    if (theme === 'dark') html.classList.add('dark'); else html.classList.remove('dark')
    localStorage.setItem('shelfquest:theme', theme)
  }, [theme])

  return (
    <button
      className="btn"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {mounted ? (
        theme === 'dark' ? (
          <span className="inline-flex items-center gap-2"><MoonIcon className="h-5 w-5" /> Dark</span>
        ) : (
          <span className="inline-flex items-center gap-2"><SunIcon className="h-5 w-5" /> Light</span>
        )
      ) : 'Theme'}
    </button>
  )
}
