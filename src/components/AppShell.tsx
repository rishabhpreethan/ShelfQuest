"use client"

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import ThemeToggle from '@/components/ThemeToggle'
import { Bars3Icon, HeartIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Prevent page scroll on mobile when sidebar is open
  useEffect(() => {
    const body = document.body
    if (sidebarOpen) body.classList.add('overflow-hidden')
    else body.classList.remove('overflow-hidden')
    return () => body.classList.remove('overflow-hidden')
  }, [sidebarOpen])

  return (
    <div className="relative">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`${sidebarOpen ? 'sm:pl-64' : ''} transition-[padding] duration-200`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <header className="mb-6 flex items-center justify-between rounded-pixel border bg-white dark:bg-neutral-900 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-pixel border hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setSidebarOpen(v => !v)}
                aria-label="Open menu"
                title="Open menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                {/* Ensure the logo file exists at public/shelfquestlogo.png */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/shelfquestlogo.png" alt="ShelfQuest" className="h-12 sm:h-12 w-auto dark:invert" />
                <span className="text-xl sm:text-2xl font-bold tracking-tight">ShelfQuest</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <a href="#donate" className="hidden sm:inline-flex btn-secondary items-center gap-2 px-3 py-2"><HeartIcon className="h-5 w-5" /> Donate</a>
              <a href="#contact" className="hidden sm:inline-flex btn-secondary items-center gap-2 px-3 py-2"><EnvelopeIcon className="h-5 w-5" /> Contact</a>
              <ThemeToggle />
            </div>
          </header>
          {children}

        </div>
      </div>
    </div>
  )
}
