import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import AppShell from '@/components/AppShell'

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var saved = localStorage.getItem('shelfquest:theme');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved === 'light' || saved === 'dark' ? saved : (prefersDark ? 'dark' : 'light');
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                } catch(_) {}
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
