import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from '../hooks/useDebounce'
import { searchPlaces } from '../lib/api'

export default function LocationInput({ value, placeholder, isTarget, onSelect, onFocus, proximity }) {
  const [query, setQuery] = useState(value.text)
  const [suggestions, setSuggestions] = useState([])
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
    search(text)
  }

  const handleSelect = (result) => {
    setQuery(result.text)
    setOpen(false)
    setSuggestions([])
    onSelect(result)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={query}
        onChange={handleChange}
        onFocus={() => { onFocus(); if (suggestions.length) { positionDropdown(); setOpen(true) } }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className={`w-full h-9 px-3 rounded-lg text-sm bg-black/5 dark:bg-white/10 border focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark ${
          isTarget ? 'border-accent-light dark:border-accent-dark' : 'border-card-light dark:border-card-dark'
        }`}
      />
      {open && rect && (loading || suggestions.length > 0) && (
        <div
          className="fixed z-[100] max-h-56 overflow-y-auto rounded-lg shadow-xl glass bg-surface-light dark:bg-surface-dark border border-card-light dark:border-card-dark"
          style={{ top: rect.bottom + 4, left: rect.left, width: rect.width }}
        >
          {loading && <p className="px-3 py-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">Searching…</p>}
          {!loading && suggestions.map((s) => (
            <button
              key={s.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 border-b last:border-b-0 border-card-light dark:border-card-dark"
            >
              <p className="text-sm font-medium truncate">{s.text}</p>
              {s.context && <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{s.context}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
