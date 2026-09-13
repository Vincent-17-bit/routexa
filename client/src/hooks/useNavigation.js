import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { point, lineString } from '@turf/helpers'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import lineSlice from '@turf/line-slice'
import length from '@turf/length'

export function useNavigation(activeRoute) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [livePosition, setLivePosition] = useState(null)
  const [traveledKm, setTraveledKm] = useState(0)
  const [error, setError] = useState(null)
  const watchIdRef = useRef(null)
  const routeLineRef = useRef(null)

  useEffect(() => {
    const coords = activeRoute?.geometry?.coordinates
    routeLineRef.current = coords?.length > 1 ? lineString(coords) : null
  }, [activeRoute])

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Location is not available on this device.')
      return
    }
    if (watchIdRef.current != null) return
    setError(null)
    setIsNavigating(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude]
        setLivePosition(coords)
        const line = routeLineRef.current
        if (!line) return
        try {
          const snapped = nearestPointOnLine(line, point(coords))
          const startPt = point(line.geometry.coordinates[0])
          const sliced = lineSlice(startPt, snapped, line)
          setTraveledKm(length(sliced, { units: 'kilometers' }))
        } catch {
          // keep last known progress if projection fails for this fix
        }
      },
      () => setError('Could not access your location.'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )
  }, [])

  const stop = useCallback(() => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
    setIsNavigating(false)
    setLivePosition(null)
    setTraveledKm(0)
    setError(null)
  }, [])

  useEffect(() => () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  const cumulative = useMemo(() => {
    let acc = 0
    return (activeRoute?.segments || []).map((s) => {
      const segStart = acc
      acc += s.distanceKm
      return { start: segStart, end: acc }
    })
  }, [activeRoute])

  const distanceAheadFor = useCallback((index) => {
    if (!isNavigating) return null
    const c = cumulative[index]
    if (!c) return null
    if (c.end <= traveledKm) return -1
    return Math.max(0, c.start - traveledKm)
  }, [isNavigating, cumulative, traveledKm])

  const remainingKm = activeRoute ? Math.max(0, activeRoute.distanceKm - traveledKm) : 0

  return { isNavigating, livePosition, traveledKm, remainingKm, error, start, stop, distanceAheadFor }
}
