import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ShelfQuest',
  description: 'Scan shelves, get AI-powered book recommendations with rich details.',
  icons: {
    icon: '/favicon.svg',
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100`}>
        <Sidebar>
          <div className="max-w-6xl mx-auto px-4 py-6">
            <header className="mb-6 flex items-center justify-between rounded-pixel border bg-white dark:bg-neutral-900 px-4 py-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ShelfQuest</h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </header>
            {children}
            <footer className="mt-10 text-xs opacity-60">
              Built with Next.js, Tailwind, and Gemini.
            </footer>
          </div>
        </Sidebar>
      </body>
    </html>
  )
}
