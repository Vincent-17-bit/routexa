import { useDebouncedCallback } from '../hooks/useDebounce'

const MODES = [
  { id: 'car', label: 'Car', icon: '🚗' },
  { id: 'transit', label: 'Transit / Bus', icon: '🚌' },
  { id: 'motorbike', label: 'Motorbike', icon: '🏍️' }
]

export default function SearchPanel({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onReverse,
  onCancel,
  onFocusInput,
  mode,
  onModeChange,
  compact
}) {
  const debouncedReverse = useDebouncedCallback(onReverse, 300)

  if (compact) {
    return (
      <button
        onClick={onFocusInput}
        className="w-full h-full flex items-center px-4 text-sm text-text-secondary-light dark:text-text-secondary-dark text-left"
      >
        {origin || destination ? `${origin || '...'} → ${destination || '...'}` : 'Where to?'}
      </button>
    )
  }

  return (
    <div className="px-4 pt-1 pb-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex flex-col gap-2">
          <input
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            onFocus={onFocusInput}
            placeholder="Starting point"
            className="w-full h-9 px-3 rounded-lg text-sm bg-black/5 dark:bg-white/10 border border-card-light dark:border-card-dark focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark"
          />
          <input
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            onFocus={onFocusInput}
            placeholder="Destination"
            className="w-full h-9 px-3 rounded-lg text-sm bg-black/5 dark:bg-white/10 border border-card-light dark:border-card-dark focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark"
          />
        </div>

        <button
          onClick={debouncedReverse}
          title="Reverse starting point and destination"
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-card-light dark:border-card-dark hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
        >
          ⇅
        </button>

        <button
          onClick={onCancel}
          title="Clear route"
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-card-light dark:border-card-dark hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            title={m.label}
            onClick={() => onModeChange(m.id)}
            className={`flex-1 h-9 rounded-lg text-sm border transition-colors ${
              mode === m.id
                ? 'bg-accent-light/10 dark:bg-accent-dark/10 border-accent-light dark:border-accent-dark text-accent-light dark:text-accent-dark'
                : 'border-card-light dark:border-card-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {m.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
