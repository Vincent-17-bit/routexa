import { useSearchParams } from '../lib/router'

const DEFAULTS = { range: 'all', browser: [], device: [], sort: 'timestamp', dir: 'desc' }

export function useLogFilters() {
  const [params, setParams] = useSearchParams()

  const filters = {
    range: params.get('range') || DEFAULTS.range,
    browser: params.get('browser') ? params.get('browser').split(',') : [],
    device: params.get('device') ? params.get('device').split(',') : [],
    sort: params.get('sort') || DEFAULTS.sort,
    dir: params.get('dir') || DEFAULTS.dir
  }

  const setRange = (range) => setParams({ range: range === 'all' ? null : range })

  const toggleBrowser = (val) => {
    const set = new Set(filters.browser)
    set.has(val) ? set.delete(val) : set.add(val)
    setParams({ browser: [...set] })
  }

  const toggleDevice = (val) => {
    const set = new Set(filters.device)
    set.has(val) ? set.delete(val) : set.add(val)
    setParams({ device: [...set] })
  }

  const setSort = (col) => {
    if (filters.sort === col) setParams({ dir: filters.dir === 'asc' ? 'desc' : 'asc' })
    else setParams({ sort: col, dir: 'desc' })
  }

  const removeChip = (kind, val) => {
    if (kind === 'range') return setRange('all')
    if (kind === 'browser') return toggleBrowser(val)
    if (kind === 'device') return toggleDevice(val)
  }

  const resetAll = () => setParams({ range: null, browser: null, device: null, sort: null, dir: null }, { replace: true })

  const chips = [
    ...(filters.range !== 'all' ? [{ kind: 'range', val: filters.range, label: filters.range }] : []),
    ...filters.browser.map((b) => ({ kind: 'browser', val: b, label: b })),
    ...filters.device.map((d) => ({ kind: 'device', val: d, label: d }))
  ]

  return { filters, setRange, toggleBrowser, toggleDevice, setSort, removeChip, resetAll, chips }
}
