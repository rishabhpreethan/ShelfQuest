"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Upload from '@/components/Upload'
import Preferences from '@/components/Preferences'
import Results from '@/components/Results'
import { loadPrefs, savePrefs } from '@/lib/storage'
import Stepper from '@/components/Stepper'
import { CameraIcon, ChevronRightIcon, BookOpenIcon, AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HomePage() {
  const params = useSearchParams()
  const [extracted, setExtracted] = useState<{ titles: string[], authors: string[] }>({ titles: [], authors: [] })
  const [prefs, setPrefs] = useState(loadPrefs())
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    savePrefs(prefs)
  }, [prefs])

  useEffect(() => {
    const s = params.get('start')
    const stepParam = params.get('step')
    if (s === '1') {
      setShowWizard(true)
      if (stepParam === '2') setStep(2)
      else if (stepParam === '3') setStep(3)
      else setStep(1)
    }
  }, [params])

  const canRecommend = useMemo(() => extracted.titles.length > 0, [extracted])

  const getRecommendations = async () => {
    setLoading(true)
    try {
      const metaRes = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titles: extracted.titles })
      })
      const metadata = await metaRes.json()

      const recRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extracted, prefs, metadata })
      })
      const rec = await recRes.json()
      setResults({ metadata, rec })
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
      {!showWizard && (
        <section id="home" className="space-y-8 animate-fade-slide">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">AI bookshelf scanner and book recommender</h2>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl">Find the perfect book for you. Upload a photo of your shelf, set your preferences, and get tailored picks with reasons and links.</p>
            <Link id="start" href="/scan" className="btn inline-flex items-center gap-2">
              <CameraIcon className="h-5 w-5" /> Start Scanning
            </Link>
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
        </section>
      )}

      {showWizard && <Stepper current={step} />}

      {showWizard && step === 1 && (
        <section className="space-y-4 animate-fade-slide">
          <h2 className="font-semibold text-lg">Step 1: Scan your shelf</h2>
          <p className="text-sm opacity-80">Upload a clear photo of your bookshelf. We’ll extract titles automatically.</p>
          <Upload onExtracted={(v) => { setExtracted(v); setResults(null); }} />
          <div className="flex justify-between pt-2">
            <span className="text-sm opacity-70">{extracted.titles.length ? `${extracted.titles.length} titles detected` : ''}</span>
            <button
              disabled={!extracted.titles.length}
              onClick={() => setStep(2)}
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
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button
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
            <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
            <button onClick={() => setStep(1)} className="btn-secondary">Start Over</button>
          </div>
        </section>
      )}
    </main>
  )
}
