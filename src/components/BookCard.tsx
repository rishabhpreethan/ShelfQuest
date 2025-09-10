export default function BookCard({ book, reason }: { book: any, reason?: string }) {
  const link = book.amazonAffiliate || book.previewLink || book.infoLink
  return (
    <article className="card p-3 flex gap-3">
      {book.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={book.thumbnail} alt={book.title} className="w-20 h-28 object-cover border" />
      )}
      <div className="space-y-1">
        <h4 className="font-semibold leading-snug">{book.title}</h4>
        {book.authors?.length ? <p className="text-sm opacity-80">by {book.authors.join(', ')}</p> : null}
        {book.summary && <p className="text-sm opacity-80 line-clamp-3">{book.summary}</p>}
        {reason && <p className="text-xs italic opacity-70">Why: {reason}</p>}
        {link && (
          <a href={link} target="_blank" className="link mt-1 text-sm">Buy / Preview</a>
        )}
      </div>
    </article>
  )
}
