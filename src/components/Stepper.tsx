import clsx from 'clsx'

export default function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { id: 1, label: 'Scan Shelf' },
    { id: 2, label: 'Preferences' },
    { id: 3, label: 'Recommendations' },
  ] as const

  return (
    <div className="mb-4">
      <div className="relative h-1 bg-neutral-200 dark:bg-neutral-800 rounded-pixel">
        <div
          className="absolute h-1 bg-brand-600 transition-all"
          style={{ width: `${((current - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <ol className="mt-3 grid grid-cols-3 gap-2" aria-label="Steps">
        {steps.map((s) => {
          const active = current === s.id
          const complete = current > s.id
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span className={clsx(
                'w-7 h-7 inline-flex items-center justify-center text-xs font-extrabold border rounded-pixel',
                complete ? 'bg-brand-600 text-white' : active ? 'bg-brand-500 text-white' : 'bg-neutral-200 text-neutral-800'
              )}>
                {s.id}
              </span>
              <span className={clsx('text-sm font-semibold tracking-tight', active && 'text-brand-800 dark:text-brand-200')}>
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
