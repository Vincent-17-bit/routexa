import LogTable from '../components/ui/LogTable'

const columns = [
  { key: 'device_id', label: 'Device', render: (r) => r.device_model || r.device_id },
  { key: 'query_text', label: 'Query' },
  { key: 'mode', label: 'Mode' },
  { key: 'result_count', label: 'Results' },
  { key: 'timestamp', label: 'Timestamp' }
]

function mobileRow(row, onDelete) {
  return (
    <div key={row.id} className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm text-text-primary">{row.device_model || row.device_id} · {row.query_text}</div>
        <div className="mt-1 text-xs text-text-secondary">{row.mode} · {row.result_count} results · {row.timestamp}</div>
      </div>
      <button onClick={onDelete} className="text-text-muted hover:text-danger" aria-label="delete">
        ⌫
      </button>
    </div>
  )
}

export default function SearchAnalytics() {
  return <LogTable type="search" columns={columns} renderMobileRow={mobileRow} />
}
