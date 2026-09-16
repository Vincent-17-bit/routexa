import { useEffect, useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { getDevice } from '../../lib/api'
import StatusPill from '../ui/StatusPill'

export default function DeviceDetailSheet({ deviceId, onClose }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!deviceId) return
    getDevice(deviceId).then(setData)
  }, [deviceId])

  return (
    <BottomSheet open={!!deviceId} onClose={onClose} title={deviceId} initialStage="sheet2">
      {!data ? (
        <div className="text-xs text-text-muted">Loading…</div>
      ) : (
        <div className="flex flex-col gap-4 text-sm">
          <div className="text-text-secondary text-xs">
            {data.device.device_model ? `${data.device.device_model} · ` : ''}
            {data.device.device_type} · {data.device.os} · {data.device.browser} · {data.device.total_sessions} sessions
          </div>

          <div>
            <div className="mb-1 text-xs text-text-muted">Logins</div>
            {data.logins.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b-[0.5px] border-border py-1.5">
                <span className="text-text-secondary text-xs">{r.timestamp}</span>
                <StatusPill tone={r.success ? 'success' : 'danger'}>{r.success ? 'OK' : 'FAIL'}</StatusPill>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-1 text-xs text-text-muted">Searches</div>
            {data.searches.map((r) => (
              <div key={r.id} className="border-b-[0.5px] border-border py-1.5 text-xs text-text-secondary">
                {r.query_text} · {r.timestamp}
              </div>
            ))}
          </div>

          <div>
            <div className="mb-1 text-xs text-text-muted">Routes</div>
            {data.routes.map((r) => (
              <div key={r.id} className="border-b-[0.5px] border-border py-1.5 text-xs text-text-secondary">
                {r.origin} → {r.destination} · {r.timestamp}
              </div>
            ))}
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
