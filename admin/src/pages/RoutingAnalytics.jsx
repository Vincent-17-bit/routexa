import LogTable from '../components/ui/LogTable'
import StatusPill from '../components/ui/StatusPill'

const columns = [
  { key: 'device_id', label: 'Device', render: (r) => r.device_model || r.device_id },
  { key: 'origin', label: 'Route', render: (r) => `${r.origin} → ${r.destination}` },
  { key: 'mode', label: 'Mode' },
  { key: 'distance_km', label: 'Distance', render: (r) => `${r.distance_km ?? '—'} km` },
  { key: 'eta_min', label: 'ETA', render: (r) => `${r.eta_min ?? '—'} min` },
  { key: 'tolls_detected', label: 'Tolls', render: (r) => (r.tolls_detected ? <StatusPill tone="danger">Tolls</StatusPill> : <StatusPill tone="neutral">None</StatusPill>) },
  { key: 'timestamp', label: 'Timestamp' }
]

function mobileRow(row, onDelete) {
  return (
    <div key={row.id} className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm text-text-primary">{row.origin} → {row.destination}</div>
        <div className="mt-1 text-xs text-text-secondary">{row.mode} · {row.distance_km ?? '—'} km · {row.timestamp}</div>
      </div>
      <button onClick={onDelete} className="text-text-muted hover:text-danger" aria-label="delete">
        ⌫
      </button>
    </div>
  )
}

export default function RoutingAnalytics() {
  return <LogTable type="route" columns={columns} renderMobileRow={mobileRow} />
}
