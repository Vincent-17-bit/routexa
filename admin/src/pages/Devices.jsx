import { useEffect, useState } from 'react'
import { getDevices } from '../lib/api'
import StatusPill from '../components/ui/StatusPill'
import DeviceDetailSheet from '../components/layout/DeviceDetailSheet'

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
            <div className="text-sm text-text-primary">{d.device_model || d.device_id}</div>
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
