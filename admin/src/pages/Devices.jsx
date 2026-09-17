import { useEffect, useState } from 'react'
import { getDevices } from '../lib/api'
import StatusPill from '../components/ui/StatusPill'
import DeviceDetailSheet from '../components/layout/DeviceDetailSheet'
import { CATEGORY_ICON, categoryModelLabel } from '../lib/deviceCategory'

export default function Devices() {
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getDevices({}).then((d) => setRows(d.rows))
  }, [])

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

      <DeviceDetailSheet deviceId={selected} onClose={() => setSelected(null)} />
    </div>
  )
}