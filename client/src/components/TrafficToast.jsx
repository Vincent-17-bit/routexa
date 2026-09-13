import { useEffect, useRef, useState } from 'react'
import { getStatusMeta, resolveTrafficStatus, segmentMessage } from '../lib/trafficStatus'

const QUEUE_INTERVAL_MS = 4000
const RENOTIFY_MS = 5 * 60 * 1000

export function useTrafficWatcher(segments, getAheadKmRef) {
  const [current, setCurrent] = useState(null)
  const [feed, setFeed] = useState([])
  const lastSentRef = useRef(new Map())
  const queueRef = useRef([])
  const timerRef = useRef(null)

  const drainQueue = () => {
    if (timerRef.current) return
    const step = () => {
      const next = queueRef.current.shift()
      if (!next) {
        timerRef.current = null
        return
      }
      setCurrent(next)
      setFeed((prev) => [next, ...prev].slice(0, 30))
      timerRef.current = setTimeout(step, QUEUE_INTERVAL_MS)
    }
    step()
  }

  useEffect(() => {
    if (!segments?.length) {
      lastSentRef.current.clear()
      queueRef.current = []
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setCurrent(null)
      return
    }

    const now = Date.now()
    const getAheadKm = getAheadKmRef?.current

    segments.forEach((segment, index) => {
      const aheadKm = getAheadKm ? getAheadKm(index) : null
      if (aheadKm === -1) return

      const status = resolveTrafficStatus(segment.speedKmh)
      const key = segment.name
      const prior = lastSentRef.current.get(key)
      const isNew = !prior
      const changed = prior && prior.status !== status
      const stale = prior && now - prior.ts >= RENOTIFY_MS

      if (isNew || changed || stale) {
        lastSentRef.current.set(key, { status, ts: now })
        const message = segmentMessage(segment, aheadKm)
        queueRef.current.push({ id: `${now}-${index}-${Math.random().toString(36).slice(2, 7)}`, ts: now, ...message })
      }
    })

    drainQueue()
  }, [segments])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

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
        <div className={`h-full ${meta.badge} toast-countdown`} style={{ animationDuration: `${QUEUE_INTERVAL_MS}ms` }} />
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
