import { useEffect, useRef, useState } from 'react'
import { getStatusMeta, segmentMessage } from '../lib/trafficStatus'

const CYCLE_MS = 4500

export function useTrafficFeed(segments) {
  const [current, setCurrent] = useState(null)
  const [feed, setFeed] = useState([])
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setFeed([])
    setCurrent(null)
    if (!segments?.length) return

    const emit = () => {
      const segment = segments[indexRef.current % segments.length]
      const message = { id: `${Date.now()}-${indexRef.current}`, ts: Date.now(), ...segmentMessage(segment) }
      setCurrent(message)
      setFeed((prev) => [message, ...prev].slice(0, 20))
      indexRef.current += 1
    }

    emit()
    const interval = setInterval(emit, CYCLE_MS)
    return () => clearInterval(interval)
  }, [segments])

  return { current, feed }
}

export function TrafficToast({ message }) {
  if (!message) return null
  const meta = getStatusMeta(message.status)

  return (
    <div
      key={message.id}
      className={`fixed top-28 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,360px)] rounded-xl shadow-2xl glass bg-surface-light dark:bg-surface-dark border-l-4 ${meta.border} overflow-hidden toast-slide-in`}
    >
      <div className="px-3 py-2.5 flex items-start gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${meta.badge} ${meta.text}`}>
          {meta.label}
        </span>
        <p className="text-xs leading-snug text-text-primary-light dark:text-text-primary-dark">{message.text}</p>
      </div>
      <div className="h-0.5 bg-black/10 dark:bg-white/10">
        <div className={`h-full ${meta.badge} toast-countdown`} style={{ animationDuration: `${CYCLE_MS}ms` }} />
      </div>
    </div>
  )
}

export function TrafficFeed({ feed }) {
  if (!feed.length) return null
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">Live updates</p>
      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
        {feed.map((m) => {
          const meta = getStatusMeta(m.status)
          return (
            <div key={m.id} className={`text-xs px-2.5 py-1.5 rounded-lg border-l-4 ${meta.border} bg-black/[0.03] dark:bg-white/[0.04]`}>
              {m.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}
