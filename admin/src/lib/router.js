import { useSyncExternalStore } from 'react'

function subscribe(cb) {
  window.addEventListener('popstate', cb)
  window.addEventListener('locationchange', cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener('locationchange', cb)
  }
}

export function navigate(to, { replace = false } = {}) {
  if (replace) window.history.replaceState(null, '', to)
  else window.history.pushState(null, '', to)
  window.dispatchEvent(new Event('locationchange'))
}

export function useLocation() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname + window.location.search,
    () => '/'
  )
}

export function usePath() {
  const loc = useLocation()
  return loc.split('?')[0]
}

export function useSearchParams() {
  const loc = useLocation()
  const params = new URLSearchParams(loc.split('?')[1] || '')
  const set = (next, opts) => {
    const p = new URLSearchParams(params)
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) p.delete(k)
      else p.set(k, Array.isArray(v) ? v.join(',') : v)
    })
    const qs = p.toString()
    navigate(window.location.pathname + (qs ? `?${qs}` : ''), opts)
  }
  return [params, set]
}
