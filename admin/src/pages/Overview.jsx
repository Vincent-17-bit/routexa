import { useEffect, useState } from 'react'
import { getOverview, getLogs, softDeleteLog } from '../lib/api'
import MetricCard from '../components/ui/MetricCard'
import TrendChart from '../components/ui/TrendChart'
import StatusPill from '../components/ui/StatusPill'

export default function Overview() {
  const [data, setData] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    getOverview().then(setData)
    getLogs('login', { range: 'all', sort: 'timestamp', dir: 'desc', pageSize: 8 }).then((r) => setRecent(r.rows))
  }, [])

  if (!data) return <div className="text-sm text-text-muted">Loading…</div>

  async function handleDelete(id) {
    await softDeleteLog('login', id)
    setRecent((rows) => rows.filter((r) => r.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total devices" value={data.totalDevices} icon="▣" />
        <MetricCard label="Active now" value={data.activeNow} icon="●" />
        <MetricCard label="Logins today" value={data.loginsToday} icon="⌘" />
        <MetricCard label="Searches today" value={data.searchesToday} icon="⌕" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border-[0.5px] border-border bg-surface p-4">
          <div className="mb-2 text-xs text-text-secondary">7-day trend</div>
          <TrendChart trend={data.trend} />
        </div>

        <div className="rounded-xl border-[0.5px] border-border bg-surface p-4">
          <div className="mb-2 text-xs text-text-secondary">Recent logins</div>
          <div className="divide-y divide-border">
            {recent.map((row) => (
              <div key={row.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="text-text-primary">{row.device_id}</div>
                  <div className="text-xs text-text-secondary">{row.geo_city}, {row.geo_country} · {row.timestamp}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill tone={row.success ? 'success' : 'danger'}>{row.success ? 'OK' : 'FAIL'}</StatusPill>
                  <button onClick={() => handleDelete(row.id)} className="text-text-muted hover:text-danger" aria-label="delete">
                    ⌫
                  </button>
                </div>
              </div>
            ))}
            {!recent.length && <div className="py-2 text-xs text-text-muted">No logins yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
