import LogTable from '../components/ui/LogTable'
import StatusPill from '../components/ui/StatusPill'

const columns = [
  { key: 'device_id', label: 'Device' },
  { key: 'geo_city', label: 'Location', render: (r) => `${r.geo_city || '—'}, ${r.geo_country || '—'}` },
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'success', label: 'Status', render: (r) => <StatusPill tone={r.success ? 'success' : 'danger'}>{r.success ? 'OK' : 'FAIL'}</StatusPill> }
]

function mobileRow(row, onDelete) {
  return (
    <div key={row.id} className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm text-text-primary">{row.device_id} · {row.geo_city}, {row.geo_country}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
          {row.timestamp}
          <StatusPill tone={row.success ? 'success' : 'danger'}>{row.success ? 'OK' : 'FAIL'}</StatusPill>
        </div>
      </div>
      <button onClick={onDelete} className="text-text-muted hover:text-danger" aria-label="delete">
        ⌫
      </button>
    </div>
  )
}

export default function LoginLogs() {
  return <LogTable type="login" columns={columns} renderMobileRow={mobileRow} />
}
