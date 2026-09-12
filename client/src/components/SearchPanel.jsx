const MODES = [
  { id: 'car', label: 'Car', icon: 'fas fa-car' },
  { id: 'transit', label: 'Transit / Bus', icon: 'fas fa-bus' },
  { id: 'motorbike', label: 'Motorbike', icon: 'fas fa-motorcycle' }
]

export default function SearchPanel({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onOriginFocus,
  onDestinationFocus,
  onReverse,
  onCancel,
  onFocusInput,
  mode,
  onModeChange,
  pickTargetField,
  canShowRoute,
  onShowRoute,
  routeLoading,
  compact
}) {
  if (compact) {
    return (
      <button
        onClick={onFocusInput}
        className="w-full h-full flex items-center px-4 text-sm text-text-secondary-light dark:text-text-secondary-dark text-left"
      >
        {origin.text || destination.text ? `${origin.text || '...'} → ${destination.text || '...'}` : 'Where to?'}
      </button>
    )
  }

  return (
    <div className="px-4 pt-1 pb-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex flex-col gap-2">
          <input
            value={origin.text}
            onChange={(e) => onOriginChange(e.target.value)}
            onFocus={() => { onFocusInput(); onOriginFocus() }}
            placeholder="Starting point"
            className={`w-full h-9 px-3 rounded-lg text-sm bg-black/5 dark:bg-white/10 border focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark ${
              pickTargetField === 'origin' ? 'border-accent-light dark:border-accent-dark' : 'border-card-light dark:border-card-dark'
            }`}
          />
          <input
            value={destination.text}
            onChange={(e) => onDestinationChange(e.target.value)}
            onFocus={() => { onFocusInput(); onDestinationFocus() }}
            placeholder="Destination"
            className={`w-full h-9 px-3 rounded-lg text-sm bg-black/5 dark:bg-white/10 border focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark ${
              pickTargetField === 'destination' ? 'border-accent-light dark:border-accent-dark' : 'border-card-light dark:border-card-dark'
            }`}
          />
        </div>

        <button
          onClick={onReverse}
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
            className={`flex-1 h-9 rounded-lg text-base border transition-colors ${
              mode === m.id
                ? 'bg-accent-light/10 dark:bg-accent-dark/10 border-accent-light dark:border-accent-dark text-accent-light dark:text-accent-dark'
                : 'border-card-light dark:border-card-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <i className={m.icon} aria-hidden="true" />
            <span className="sr-only">{m.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onShowRoute}
        disabled={!canShowRoute || routeLoading}
        className="h-10 rounded-lg text-sm font-semibold bg-accent-light dark:bg-accent-dark text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
      >
        {routeLoading ? 'Finding route…' : 'Show route'}
      </button>
    </div>
  )
}
