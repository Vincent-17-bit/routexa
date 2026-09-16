import { useEffect, useState } from 'react'
import { getLogs } from '../lib/api'

export function useLogData(type, filters, page, pageSize = 25) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const refresh = () => setRefreshTick((t) => t + 1)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getLogs(type, { ...filters, page, pageSize, browser: filters.browser.join(','), device: filters.device.join(',') })
      .then((data) => {
        if (!alive) return
        setRows(data.rows)
        setError(null)
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [type, filters.range, filters.browser.join(','), filters.device.join(','), filters.sort, filters.dir, page, pageSize, refreshTick])

  return { rows, loading, error, refresh }
}
