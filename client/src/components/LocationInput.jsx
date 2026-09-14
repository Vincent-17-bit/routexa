import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from '../hooks/useDebounce'
import { searchPlaces } from '../lib/api'

export default function LocationInput({ value, placeholder, isTarget, onSelect, onFocus, proximity, variant, recentSearches }) {
  const [query, setQuery] = useState(value.text)
  const [suggestions, setSuggestions] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rect, setRect] = useState(null)
  const inputRef = useRef(null)
  const proximityRef = useRef(proximity)

  useEffect(() => {
    proximityRef.current = proximity
  }, [proximity])

  useEffect(() => {
    setQuery(value.text)
  }, [value.text])

  const positionDropdown = () => {
    if (inputRef.current) setRect(inputRef.current.getBoundingClientRect())
  }

  const search = useDebouncedCallback(async (text) => {
    if (!text.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const results = await searchPlaces(text, proximityRef.current)
      setSuggestions(results)
      positionDropdown()
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, 300)

  const handleChange = (e) => {
    const text = e.target.value
    setQuery(text)
    const q = text.trim().toLowerCase()
    const matches = q ? (recentSearches || []).filter((r) => r.text.toLowerCase().includes(q)).slice(0, 3) : []
    setRecentMatches(matches)
    if (matches.length) {
      positionDropdown()
      setOpen(true)
    }
    search(text)
  }

  const handleSelect = (result) => {
    setQuery(result.text)
    setOpen(false)
    setSuggestions([])
    setRecentMatches([])
    onSelect(result)
  }

  const liveSuggestions = suggestions.filter((s) => !recentMatches.some((r) => r.text === s.text))
  const showDropdown = open && rect && (loading || recentMatches.length > 0 || liveSuggestions.length > 0)

  return (
    <div className="relative flex items-center gap-2.5">
      {variant === 'origin' ? (
        <span className="shrink-0 w-2.5 h-2.5 rounded-full border-2 border-slate-400 dark:border-slate-500" />
      ) : (
        <i className="fas fa-location-dot shrink-0 text-rose-500 text-sm" />
      )}
      <div className="relative flex-1">
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => { onFocus(); if (suggestions.length || recentMatches.length) { positionDropdown(); setOpen(true) } }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className={`w-full h-9 pl-3 pr-8 rounded-lg text-sm bg-black/5 dark:bg-white/10 border focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark ${
            isTarget ? 'border-accent-light dark:border-accent-dark' : 'border-card-light dark:border-card-dark'
          }`}
        />
        <i className="fas fa-magnifying-glass absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-secondary-light dark:text-text-secondary-dark pointer-events-none" />
        {showDropdown && (
          <div
            className="fixed z-[100] max-h-56 overflow-y-auto rounded-lg shadow-xl glass bg-surface-light dark:bg-surface-dark border border-card-light dark:border-card-dark"
            style={{ top: rect.bottom + 4, left: rect.left, width: rect.width }}
          >
            {recentMatches.map((r) => (
              <button
                key={`recent-${r.id}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect({ id: r.id, text: r.text, context: r.context, center: r.center, bbox: null })}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 border-b border-card-light dark:border-card-dark"
              >
                <i className="fas fa-clock-rotate-left text-xs text-text-secondary-light dark:text-text-secondary-dark shrink-0" />
                <span className="min-w-0">
                  <p className="text-sm font-medium truncate text-text-primary-light dark:text-text-primary-dark">{r.text}</p>
                  {r.context && <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{r.context}</p>}
                </span>
              </button>
            ))}
            {loading && <p className="px-3 py-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">Searching…</p>}
            {!loading && liveSuggestions.map((s) => (
              <button
                key={s.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 border-b last:border-b-0 border-card-light dark:border-card-dark"
              >
                <i className="fas fa-location-dot text-xs text-rose-500 shrink-0" />
                <span className="min-w-0">
                  <p className="text-sm font-medium truncate text-text-primary-light dark:text-text-primary-dark">{s.text}</p>
                  {s.context && <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{s.context}</p>}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
