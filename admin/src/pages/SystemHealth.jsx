import { useEffect, useState } from 'react'
import { checkHealth } from '../lib/api'
import StatusPill from '../components/ui/StatusPill'

export default function SystemHealth() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    checkHealth().then(() => setStatus('ok')).catch(() => setStatus('down'))
  }, [])

  return (
    <div className="rounded-xl border-[0.5px] border-border bg-surface p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-primary">API server</span>
        <StatusPill tone={status === 'ok' ? 'success' : status === 'checking' ? 'neutral' : 'danger'}>
          {status}
        </StatusPill>
      </div>
    </div>
  )
}
