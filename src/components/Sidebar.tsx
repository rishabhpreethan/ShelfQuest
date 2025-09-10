"use client"

import { HomeIcon, PhotoIcon, AdjustmentsHorizontalIcon, BookmarkIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 sm:hidden transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden
      />
      <aside className={`fixed z-50 top-0 left-0 h-full border-r bg-white dark:bg-neutral-900 w-64 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-4 py-4 flex items-center justify-between border-b">
          <span className="font-semibold">Menu</span>
          <button className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={onClose} aria-label="Close sidebar" title="Close">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-2 space-y-1">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <HomeIcon className="h-5 w-5" /> <span>Home</span>
          </Link>
          <Link href="/scan" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <PhotoIcon className="h-5 w-5" /> <span>Scan</span>
          </Link>
          <Link href="/preferences" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <AdjustmentsHorizontalIcon className="h-5 w-5" /> <span>Preferences</span>
          </Link>
          <Link href="/saved" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <BookmarkIcon className="h-5 w-5" /> <span>Saved</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}
