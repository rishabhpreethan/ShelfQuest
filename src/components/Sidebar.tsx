"use client"

import { useState } from 'react'
import { Bars3Icon, HomeIcon, PhotoIcon, AdjustmentsHorizontalIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex gap-4">
      <aside className={`fixed z-40 top-0 left-0 h-full border-r bg-white dark:bg-neutral-900 w-64 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}>
        <div className="px-4 py-4 flex items-center justify-between border-b">
          <span className="font-semibold">Menu</span>
          <button className="sm:hidden p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setOpen(false)} aria-label="Close sidebar">
            ✕
          </button>
        </div>
        <nav className="p-2 space-y-1">
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <HomeIcon className="h-5 w-5" /> <span>Home</span>
          </Link>
          <a href="#start" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <PhotoIcon className="h-5 w-5" /> <span>Scan</span>
          </a>
          <a href="#prefs" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <AdjustmentsHorizontalIcon className="h-5 w-5" /> <span>Preferences</span>
          </a>
          <a href="#saved" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <BookmarkIcon className="h-5 w-5" /> <span>Saved</span>
          </a>
        </nav>
      </aside>
      <div className="flex-1 sm:pl-64">
        <div className="sm:hidden -mt-2 mb-2">
          <button className="p-2 rounded border" onClick={() => setOpen(true)} aria-label="Open sidebar">
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
