import { useEffect, useState } from 'react'
import { getDevices } from '../lib/api'
import StatusPill from '../components/ui/StatusPill'
import DeviceDetailSheet from '../components/layout/DeviceDetailSheet'
import { CATEGORY_ICON, categoryModelLabel } from '../lib/deviceCategory'

const PAGE_SIZE = 25

export default function Devices() {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getDevices({ page, pageSize: PAGE_SIZE }).then((d) => {
      setRows(d.rows)
      setTotal(d.total ?? d.rows.length)
    })
  }, [page])

  const hasNext = (page + 1) * PAGE_SIZE < total

  return (
    <div className="rounded-xl border-[0.5px] border-border bg-surface divide-y divide-border">
      {rows.map((d) => (
        <button
          key={d.device_id}
          onClick={() => setSelected(d.device_id)}
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-nested"
        >
          <div>
            <div className="text-sm text-text-primary">
              <span className="text-cyan mr-1">{CATEGORY_ICON[d.device_category] || CATEGORY_ICON.unknown}</span>
              {categoryModelLabel(d.device_category, d.device_model)}
            </div>
            <div className="text-xs text-text-secondary">{d.device_type} · {d.os} · {d.browser}</div>
          </div>
          <StatusPill tone={d.is_currently_online ? 'success' : 'neutral'}>
            {d.is_currently_online ? 'Online' : 'Offline'}
          </StatusPill>
        </button>
      ))}
      {!rows.length && <div className="px-4 py-6 text-xs text-text-muted">No devices yet.</div>}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between p-3 text-xs text-text-secondary">
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(p - 1, 0))} className="disabled:opacity-40">
            Prev
          </button>
          <span>Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}</span>
          <button disabled={!hasNext} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40">
            Next
          </button>
        </div>
      )}

      <DeviceDetailSheet deviceId={selected} onClose={() => setSelected(null)} />
    </div>
  )
}