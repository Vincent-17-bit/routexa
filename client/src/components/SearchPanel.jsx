import { useRef, useState } from 'react'
import LocationInput from './LocationInput'

const MODES = [
  { id: 'car', label: 'Car', icon: 'fas fa-car' },
  { id: 'transit', label: 'Bus', icon: 'fas fa-bus' },
  { id: 'motorbike', label: 'Motorbike', icon: 'fas fa-motorcycle' }
]

const SWIPE_DISMISS_PX = 70

function RecentRow({ recent, onSelect, onRemove }) {
  const [dragX, setDragX] = useState(0)
  const startXRef = useRef(null)
  const draggingRef = useRef(false)

  const onTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    draggingRef.current = true
  }

  const onTouchMove = (e) => {
    if (!draggingRef.current || startXRef.current === null) return
    const delta = e.touches[0].clientX - startXRef.current
    if (delta < 0) setDragX(delta)
  }

  const onTouchEnd = () => {
    draggingRef.current = false
    startXRef.current = null
    if (dragX < -SWIPE_DISMISS_PX) {
      onRemove(recent.id)
    } else {
      setDragX(0)
    }
  }

  return (
    <div
      className="relative overflow-hidden touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="relative flex items-center bg-surface-light dark:bg-surface-dark"
        style={{ transform: `translateX(${dragX}px)`, transition: dragX === 0 ? 'transform 0.2s ease' : 'none' }}
      >
        <button
          onClick={() => onSelect(recent)}
          className="flex-1 min-w-0 px-4 py-2.5 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/10 text-left"
        >
          <span className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">
            <i className="fas fa-clock-rotate-left text-text-secondary-light dark:text-text-secondary-dark" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium truncate">{recent.text}</span>
            {recent.context && <span className="block text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{recent.context}</span>}
          </span>
        </button>
        <button
          onClick={() => onRemove(recent.id)}
          title="Remove from recent searches"
          className="h-8 w-8 mr-2 rounded-full flex items-center justify-center shrink-0 text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/10 dark:hover:bg-white/10"
        >
          <i className="fas fa-xmark text-xs" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default function SearchPanel({
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
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
  proximity,
  onUseCurrentLocation,
  recentSearches,
  onSelectRecent,
  onRemoveRecent
}) {
  return (
    <div className="flex flex-col">
      <div className="px-4 pt-3 flex items-center gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            title={m.label}
            onClick={() => onModeChange(m.id)}
            className={`h-9 w-9 rounded-full flex items-center justify-center text-sm transition-colors ${
              mode === m.id
                ? 'bg-accent-light dark:bg-accent-dark text-white'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <i className={m.icon} aria-hidden="true" />
            <span className="sr-only">{m.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={onCancel}
          title="Clear route"
          className="h-8 w-8 rounded-full flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
        >
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
      </div>

      <div className="h-px bg-card-light dark:bg-card-dark mt-3" />

      <div className="px-4 py-3 relative">
        <div className="absolute left-[21px] top-[26px] bottom-[26px] flex flex-col items-center justify-between py-1 pointer-events-none">
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        <div className="flex flex-col gap-2 pr-8">
          <LocationInput
            value={origin}
            placeholder="Choose starting point, or click on the map"
            isTarget={pickTargetField === 'origin'}
            onSelect={onSelectOrigin}
            onFocus={() => { onFocusInput(); onOriginFocus() }}
            proximity={proximity}
            variant="origin"
            recentSearches={recentSearches}
            mode={mode}
          />
          <LocationInput
            value={destination}
            placeholder="Choose destination..."
            isTarget={pickTargetField === 'destination'}
            onSelect={onSelectDestination}
            onFocus={() => { onFocusInput(); onDestinationFocus() }}
            proximity={proximity}
            variant="destination"
            recentSearches={recentSearches}
            mode={mode}
          />
        </div>

        <button
          onClick={onReverse}
          title="Reverse starting point and destination"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center shadow-sm border border-card-light dark:border-card-dark bg-surface-light dark:bg-surface-dark hover:bg-black/5 dark:hover:bg-white/10"
        >
          <i className="fas fa-arrow-down-up-across-line text-xs text-text-secondary-light dark:text-text-secondary-dark" aria-hidden="true" />
        </button>
      </div>

      <div className="h-px bg-card-light dark:bg-card-dark" />

      <button
        onClick={() => onUseCurrentLocation(pickTargetField)}
        className="px-4 py-2.5 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/10 text-left"
      >
        <span className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">
          <i className="fas fa-location-crosshairs text-accent-light dark:text-accent-dark" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium">Your location</span>
      </button>

      {recentSearches?.length > 0 && (
        <div className="pb-2 flex flex-col gap-px">
          {recentSearches.map((r) => (
            <RecentRow key={r.id} recent={r} onSelect={onSelectRecent} onRemove={onRemoveRecent} />
          ))}
        </div>
      )}

      <div className="px-4 pb-3 pt-1">
        <button
          onClick={onShowRoute}
          disabled={!canShowRoute || routeLoading}
          className="w-full h-10 rounded-lg text-sm font-semibold bg-accent-light dark:bg-accent-dark text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
        >
          {routeLoading ? 'Finding route…' : 'Show route'}
        </button>
      </div>
    </div>
  )
}
