"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Upload from '@/components/Upload'
import BookCard from '@/components/BookCard'
import Preferences from '@/components/Preferences'
import Results from '@/components/Results'
import { loadPrefs, savePrefs } from '@/lib/storage'
import Stepper from '@/components/Stepper'
import { CameraIcon, ChevronRightIcon, BookOpenIcon, AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HomePage() {
  const [extracted, setExtracted] = useState<{ titles: string[], authors: string[] }>({ titles: [], authors: [] })
  const [prefs, setPrefs] = useState(loadPrefs())
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [metaLoading, setMetaLoading] = useState(false)
  const [metadata, setMetadata] = useState<{ books: any[] } | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showWizard, setShowWizard] = useState(false)
  const userProceed = useRef(false)

  useEffect(() => {
    savePrefs(prefs)
  }, [prefs])

  // Ensure visibility of the active step on change
  useEffect(() => {
    if (showWizard) {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { /* no-op */ }
      try { console.log('[Wizard] step change', { step, showWizard }) } catch { /* no-op */ }
    }
  }, [showWizard, step])

  // If user clicked Next but state was mid-update, auto-advance once we have titles
  useEffect(() => {
    if (!showWizard) return
    if (userProceed.current && step === 1 && extracted.titles.length > 0) {
      try { console.log('[Wizard] auto-advance to Step 2 after Next + titles ready') } catch {}
      setStep(2)
    }
  }, [showWizard, step, extracted])

  // One-shot bootstrap from sessionStorage (set by /scan route)
  useEffect(() => {
    try {
      const s = sessionStorage.getItem('shelfquest:start')
      if (s === '1') {
        sessionStorage.removeItem('shelfquest:start')
        setShowWizard(true)
        setStep(1)
      }
    } catch {}
  }, [])

  // We intentionally do not sync with URL to avoid race conditions during navigation

  const canRecommend = useMemo(() => extracted.titles.length > 0, [extracted])

  const getRecommendations = async () => {
    setLoading(true)
    try {
      // Use existing metadata from Step 1 if available; otherwise fetch
      let meta = metadata
      if (!meta || !Array.isArray(meta.books) || meta.books.length === 0) {
        const metaRes = await fetch('/api/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titles: extracted.titles })
        })
        meta = await metaRes.json()
        setMetadata(meta)
      }

      const recRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extracted, prefs, metadata: meta })
      })
      const rec = await recRes.json()
      setResults({ metadata: meta, rec })
      setStep(3)
    } catch (e) {
      console.error(e)
      setResults({ error: 'Failed to generate recommendations. You can still browse matched titles.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-10">
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-2 right-2 z-[60] text-[10px] px-2 py-1 rounded-pixel border bg-white/90 dark:bg-neutral-900/90">
          step: {step} • show: {String(showWizard)} • titles: {extracted.titles.length}
        </div>
      )}
      {!showWizard && (
        <section id="home" className="space-y-8 animate-fade-slide">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">AI bookshelf scanner and book recommender</h2>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl">Find the perfect book for you. Upload a photo of your shelf, set your preferences, and get tailored picks with reasons and links.</p>
            <button
              id="start"
              type="button"
              className="btn inline-flex items-center gap-2"
              onClick={() => { setShowWizard(true); setStep(1) }}
            >
              <CameraIcon className="h-5 w-5" /> Start Scanning
            </button>
          </div>

          <div className="card flex items-start gap-4">
            <div className="h-10 w-10 rounded-pixel border flex items-center justify-center"><BookOpenIcon className="h-6 w-6" /></div>
            <div className="flex-1">
              <h3 className="font-semibold">AI Book Discovery</h3>
              <p className="text-sm opacity-80">Take a photo of an entire bookshelf and we’ll help you figure out which ones you’ll like.</p>
              <button className="mt-2 text-sm inline-flex items-center gap-1 underline" onClick={() => { setShowWizard(true); setStep(1) }}>
                Start scanning <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">How It Works</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full border">1</span> Upload Photo</div>
                <p className="text-sm opacity-80">Take a photo of a bookshelf and our AI will identify each book.</p>
              </div>
              <div id="prefs" className="card">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full border">2</span> Set Preferences</div>
                <p className="text-sm opacity-80">Tell us about your interests and preferences to improve recommendations.</p>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full border">3</span> Find Matching Books</div>
                <p className="text-sm opacity-80">Discover which books match your taste with our AI-powered suggestions.</p>
              </div>
            </div>
          </div>
          {/* Detected books grid */}
          <div className="space-y-2">
            <h3 className="font-semibold">Detected Books</h3>
            {metaLoading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card animate-pulse h-32" />
                ))}
              </div>
            )}
            {!metaLoading && metadata && (
              metadata.books?.length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metadata.books.map((b: any) => (
                    <BookCard key={b.id} book={b} />
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-70">No books recognized yet.</p>
              )
            )}
          </div>
        </section>
      )}

      {showWizard && <Stepper current={step} />}

      {showWizard && step === 1 && (
        <section className="space-y-4 animate-fade-slide">
          <h2 className="font-semibold text-lg">Step 1: Scan your shelf</h2>
          <p className="text-sm opacity-80">Upload a clear photo of your bookshelf. We’ll extract titles automatically.</p>
          <Upload onExtracted={async (v) => {
            try { console.log('[OCR] extracted', v) } catch {}
            setExtracted(v); setResults(null)
            // Fetch metadata immediately to show detected books
            if (v.titles?.length) {
              try {
                setMetaLoading(true)
                const r = await fetch('/api/metadata', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ titles: v.titles })
                })
                const meta = await r.json()
                setMetadata(meta)
              } catch (err) {
                console.error('metadata fetch failed', err)
                setMetadata({ books: [] })
              } finally {
                setMetaLoading(false)
              }
            } else {
              setMetadata({ books: [] })
            }
          }} />
          <div className="flex justify-between pt-2">
            <span className="text-sm opacity-70">{extracted.titles.length ? `${extracted.titles.length} titles detected` : ''}</span>
            <button
              type="button"
              onClick={() => {
                try { console.log('[Wizard] Next clicked', { titles: extracted.titles.length, stepBefore: step }) } catch {}
                userProceed.current = true
                setShowWizard(true)
                // if titles already present, advance immediately, else effect will push when ready
                if (extracted.titles.length > 0) setStep(2)
                try { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) } catch {}
              }}
              className="btn"
            >Next</button>
          </div>
        </section>
      )}

      {showWizard && step === 2 && (
        <section className="space-y-4 animate-fade-slide">
          <h2 className="font-semibold text-lg">Step 2: Preferences</h2>
          <p className="text-sm opacity-80">Select genres and add favorite authors or notes. Saved locally on your device.</p>
          <Preferences value={prefs} onChange={setPrefs} />
          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button
              type="button"
              disabled={!extracted.titles.length || loading}
              onClick={getRecommendations}
              className="btn"
            >
              {loading ? 'Analyzing…' : 'Get Recommendations'}
            </button>
          </div>
        </section>
      )}

      {showWizard && step === 3 && (
        <section className="space-y-4 animate-fade-slide">
          <h2 className="font-semibold text-lg">Step 3: Recommendations</h2>
          <Results data={results} loading={loading} />
          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setStep(2)} className="btn-secondary">Back</button>
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">Start Over</button>
          </div>
        </section>
      )}
    </main>
  )
}
