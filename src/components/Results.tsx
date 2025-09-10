import BookCard from '@/components/BookCard'

export default function Results({ data, loading }: { data: any, loading?: boolean }) {
  if (!data && !loading) return <div className="text-sm opacity-70">Upload a photo and set preferences to begin.</div>
  if (data?.error) return <div className="text-sm text-red-600">{data.error}</div>

  const books = data?.metadata?.books || []
  const rec = data?.rec || null
  const byId = new Map<string, any>(books.map((b: any) => [b.id, b]))
  const ordered = Array.isArray(rec?.order)
    ? rec.order.map((id: string) => byId.get(id)).filter(Boolean)
    : []

  return (
    <div className="space-y-4">
      {rec && (
        <div className="card">
          <h3 className="font-semibold mb-2">AI Recommendation Summary</h3>
          <div className="whitespace-pre-wrap text-sm opacity-90">{rec.summary}</div>
        </div>
      )}

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse flex gap-3">
              <div className="w-20 h-28 bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && ordered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ordered.map((b: any) => (
            <BookCard key={b.id} book={b} reason={rec?.reasons?.[b.id]} />
          ))}
        </div>
      )}

      {!loading && rec && ordered.length === 0 && (
        <div className="text-sm opacity-75">No strong matches based on your preferences. Try selecting more genres or different authors.</div>
      )}
    </div>
  )
}
