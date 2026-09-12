import { resolveTrafficStatus, getStatusMeta } from '../lib/trafficStatus'
import { SHEET_STATE } from '../hooks/useSheetState'
import { TrafficFeed } from './TrafficToast'

function TrafficBadge({ speedKmh }) {
  const status = resolveTrafficStatus(speedKmh)
  const meta = getStatusMeta(status)
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge} ${meta.text}`}>
      {meta.label}
    </span>
  )
}

export default function RouteResults({ routes, activeRouteId, onSelectRoute, sheetState, feed }) {
  const active = routes.find((r) => r.id === activeRouteId)
  if (!active) return null
  const activeStatus = resolveTrafficStatus(active.speedKmh)
  const activeMeta = getStatusMeta(activeStatus)

  return (
    <div className="px-4 pb-4 flex flex-col gap-3 overflow-y-auto">
      <div className={`flex items-center justify-between border-l-4 pl-3 py-1 ${activeMeta.border}`}>
        <p className="text-sm font-semibold">via {active.via} · {active.durationMin} min ({active.distanceKm.toFixed(1)} km)</p>
        <TrafficBadge speedKmh={active.speedKmh} />
      </div>

      {sheetState === SHEET_STATE.FULL && (
        <>
          {routes.length > 1 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">Alternatives</p>
              {routes.filter((r) => r.id !== activeRouteId).map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelectRoute(r.id)}
                  className="text-left px-3 py-2 rounded-lg border border-card-light dark:border-card-dark hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <p className="text-sm">via {r.via} · {r.durationMin} min ({r.distanceKm.toFixed(1)} km)</p>
                </button>
              ))}
            </div>
          )}

          <TrafficFeed feed={feed} />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">Turn-by-turn</p>
            <ol className="flex flex-col gap-2">
              {active.segments.map((segment, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">{i + 1}.</span>
                  {segment.instruction}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  )
}
