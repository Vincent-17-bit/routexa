import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import MapContainer from './components/MapContainer'
import SearchPanel from './components/SearchPanel'
import RouteResults from './components/RouteResults'
import { TrafficToast, useTrafficWatcher } from './components/TrafficToast'
import { useSheetState, SHEET_STATE } from './hooks/useSheetState'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useDebouncedCallback } from './hooks/useDebounce'
import { useSystemTheme } from './hooks/useSystemTheme'
import { useNavigation } from './hooks/useNavigation'
import { checkHealth, reverseGeocode, fetchDirections } from './lib/api'

const EMPTY_POINT = { text: '', coords: null }
const POLL_INTERVAL_MS = 45000

export default function App() {
  useSystemTheme()
  const isMobile = !useMediaQuery('(min-width: 640px)')
  const { state: sheetState, setState: setSheetState, reset: resetSheet, dragHandlers } = useSheetState(isMobile)

  const [origin, setOrigin] = useState(EMPTY_POINT)
  const [destination, setDestination] = useState(EMPTY_POINT)
  const [mode, setMode] = useState('car')
  const [focusedField, setFocusedField] = useState(null)
  const [mapFocus, setMapFocus] = useState(null)

  const [routes, setRoutes] = useState([])
  const [activeRouteId, setActiveRouteId] = useState(null)
  const [routeDrawn, setRouteDrawn] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('routexa:recent-searches') || '[]')
    } catch {
      return []
    }
  })

  const requestIdRef = useRef(0)
  const routesRef = useRef(routes)
  const activeRouteIdRef = useRef(activeRouteId)
  const routeLoadingRef = useRef(routeLoading)

  useEffect(() => { routesRef.current = routes }, [routes])
  useEffect(() => { activeRouteIdRef.current = activeRouteId }, [activeRouteId])
  useEffect(() => { routeLoadingRef.current = routeLoading }, [routeLoading])

  useEffect(() => {
    checkHealth()
      .then(() => console.info('[routexa] server reachable'))
      .catch((err) => console.warn('[routexa] server unreachable:', err.message))
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude]
        setUserLocation(coords)
        setMapFocus({ coords, ts: Date.now() })
      },
      () => {},
      { timeout: 6000, maximumAge: 300000 }
    )
  }, [])

  const computeRoute = useCallback(async (originCoords, destCoords, activeMode) => {
    if (!originCoords || !destCoords) return
    const requestId = ++requestIdRef.current
    setRouteLoading(true)
    setRouteError(null)
    try {
      const results = await fetchDirections(originCoords, destCoords, activeMode)
      if (requestId !== requestIdRef.current) return
      setRoutes(results)
      setActiveRouteId(results[0].id)
      setRouteDrawn(true)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setRouteError(err.message)
    } finally {
      if (requestId === requestIdRef.current) setRouteLoading(false)
    }
  }, [])

  const debouncedRecompute = useDebouncedCallback(computeRoute, 300)

  const addRecentSearch = useCallback((result) => {
    if (!result.text || !result.center) return
    setRecentSearches((prev) => {
      const entry = { id: `${result.text}-${result.center[0]}-${result.center[1]}`, text: result.text, context: result.context || '', center: result.center }
      const next = [entry, ...prev.filter((r) => r.id !== entry.id)].slice(0, 3)
      try {
        localStorage.setItem('routexa:recent-searches', JSON.stringify(next))
      } catch {
        // storage unavailable (private mode etc); recents just won't persist
      }
      return next
    })
  }, [])

  const handleSelectOrigin = useCallback((result) => {
    setOrigin({ text: result.text, coords: result.center })
    setMapFocus({ coords: result.center, bbox: result.bbox, ts: Date.now() })
    addRecentSearch(result)
  }, [addRecentSearch])

  const handleSelectDestination = useCallback((result) => {
    setDestination({ text: result.text, coords: result.center })
    setMapFocus({ coords: result.center, bbox: result.bbox, ts: Date.now() })
    addRecentSearch(result)
  }, [addRecentSearch])

  const pickTargetField = useMemo(() => {
    if (focusedField === 'destination') return 'destination'
    if (focusedField === 'origin') return 'origin'
    return origin.coords ? 'destination' : 'origin'
  }, [focusedField, origin.coords])

  const handleSelectRecent = useCallback((recent) => {
    const result = { text: recent.text, center: recent.center, context: recent.context, bbox: null }
    if (pickTargetField === 'destination') handleSelectDestination(result)
    else handleSelectOrigin(result)
  }, [pickTargetField, handleSelectOrigin, handleSelectDestination])

  const handleUseCurrentLocation = useCallback((field) => {
    const apply = (coords) => {
      const result = { text: 'Your location', coords }
      if (field === 'origin') setOrigin(result)
      else setDestination(result)
      setFocusedField(null)
      setMapFocus({ coords, ts: Date.now() })
    }
    if (userLocation) {
      apply(userLocation)
      return
    }
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude]
        setUserLocation(coords)
        apply(coords)
      },
      () => {},
      { timeout: 8000 }
    )
  }, [userLocation])

  const handleMapPick = useCallback(async (field, coords, presetName) => {
    const result = presetName
      ? { text: presetName, coords }
      : await reverseGeocode(coords[0], coords[1]).catch(() => ({ text: `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`, coords }))
    if (field === 'origin') setOrigin(result)
    else setDestination(result)
    setFocusedField(null)
  }, [])

  const activeRoute = routes.find((r) => r.id === activeRouteId)
  const nav = useNavigation(activeRoute)
  const getAheadKmRef = useRef(null)
  useEffect(() => { getAheadKmRef.current = nav.distanceAheadFor }, [nav.distanceAheadFor])

  const handleReverse = useCallback(() => {
    const prevOrigin = origin
    const prevDestination = destination
    setOrigin(prevDestination)
    setDestination(prevOrigin)
    nav.stop()
    if (routeDrawn && prevDestination.coords && prevOrigin.coords) {
      setRoutes([])
      debouncedRecompute(prevDestination.coords, prevOrigin.coords, mode)
    }
  }, [origin, destination, routeDrawn, mode, debouncedRecompute, nav])

  const handleShowRoute = useCallback(async () => {
    await computeRoute(origin.coords, destination.coords, mode)
    setSheetState((s) => Math.max(s, SHEET_STATE.PREVIEW))
  }, [origin.coords, destination.coords, mode, computeRoute, setSheetState])

  const handleCancel = useCallback(() => {
    requestIdRef.current++
    nav.stop()
    setOrigin(EMPTY_POINT)
    setDestination(EMPTY_POINT)
    setFocusedField(null)
    setRoutes([])
    setActiveRouteId(null)
    setRouteDrawn(false)
    setRouteError(null)
    resetSheet()
  }, [resetSheet, nav])

  const handleFocusInput = useCallback(() => {
    setSheetState((s) => Math.max(s, SHEET_STATE.PREVIEW))
  }, [setSheetState])

  const canShowRoute = Boolean(origin.coords && destination.coords) && !routeLoading

  useEffect(() => {
    if (!routeDrawn || !origin.coords || !destination.coords) return
    const interval = setInterval(async () => {
      if (routeLoadingRef.current) return
      try {
        const results = await fetchDirections(origin.coords, destination.coords, mode)
        const prevActive = routesRef.current.find((r) => r.id === activeRouteIdRef.current)
        const matched = prevActive ? results.find((r) => r.via === prevActive.via) : null
        setRoutes(results)
        setActiveRouteId((matched || results[0])?.id ?? null)
      } catch {
        // keep showing the last known-good route data if a poll fails
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [routeDrawn, origin.coords, destination.coords, mode])

  const { current: toastMessage, feed } = useTrafficWatcher(routeDrawn ? activeRoute?.segments : null, getAheadKmRef)

  const panelContent = (
    <>
      <SearchPanel
        origin={origin}
        destination={destination}
        onSelectOrigin={handleSelectOrigin}
        onSelectDestination={handleSelectDestination}
        onOriginFocus={() => setFocusedField('origin')}
        onDestinationFocus={() => setFocusedField('destination')}
        onReverse={handleReverse}
        onCancel={handleCancel}
        onFocusInput={handleFocusInput}
        mode={mode}
        onModeChange={setMode}
        pickTargetField={pickTargetField}
        canShowRoute={canShowRoute}
        onShowRoute={handleShowRoute}
        routeLoading={routeLoading}
        proximity={userLocation}
        onUseCurrentLocation={handleUseCurrentLocation}
        recentSearches={recentSearches}
        onSelectRecent={handleSelectRecent}
        compact={isMobile && sheetState === SHEET_STATE.IDLE}
      />
      {routeError && (!isMobile || sheetState >= SHEET_STATE.PREVIEW) && (
        <p className="px-4 pb-2 text-xs text-rose-600 dark:text-rose-400">{routeError}</p>
      )}
      {routeDrawn && (!isMobile || sheetState >= SHEET_STATE.PREVIEW) && (
        <div className="px-4 pb-2 flex items-center gap-2">
          {nav.isNavigating ? (
            <button
              onClick={nav.stop}
              className="flex-1 h-9 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:brightness-110 transition"
            >
              Cancel navigation
            </button>
          ) : (
            <button
              onClick={nav.start}
              className="flex-1 h-9 rounded-lg text-sm font-semibold bg-accent-light dark:bg-accent-dark text-white hover:brightness-110 transition"
            >
              Let's go
            </button>
          )}
          {nav.isNavigating && (
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark shrink-0">
              {nav.remainingKm.toFixed(1)} km left
            </span>
          )}
        </div>
      )}
      {nav.error && (
        <p className="px-4 pb-2 text-xs text-rose-600 dark:text-rose-400">{nav.error}</p>
      )}
      {nav.isNavigating && nav.distanceFromRouteKm != null && nav.distanceFromRouteKm > 3 && (
        <p className="px-4 pb-2 text-xs text-amber-600 dark:text-amber-400">
          You're {nav.distanceFromRouteKm.toFixed(1)} km from the route — the route stays visible until you're closer.
        </p>
      )}
      {routeDrawn && (!isMobile || sheetState >= SHEET_STATE.PREVIEW) && (
        <RouteResults
          routes={routes}
          activeRouteId={activeRouteId}
          onSelectRoute={setActiveRouteId}
          sheetState={isMobile ? sheetState : SHEET_STATE.FULL}
          feed={feed}
        />
      )}
    </>
  )

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Header />
      <MapContainer
        origin={origin}
        destination={destination}
        routes={routeDrawn ? routes : []}
        activeRouteId={activeRouteId}
        pickTargetField={pickTargetField}
        onMapPick={handleMapPick}
        mapFocus={mapFocus}
        livePosition={nav.livePosition}
        distanceFromRouteKm={nav.distanceFromRouteKm}
      />
      <TrafficToast message={toastMessage} />

      {isMobile ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-t-2xl shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col"
          style={{ height: 'var(--sheet-height)' }}
        >
          <div
            className="shrink-0 flex items-center justify-center h-[22px] cursor-grab active:cursor-grabbing"
            {...dragHandlers}
          >
            <span className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20" />
          </div>
          <div className="flex-1 overflow-y-auto">{panelContent}</div>
        </div>
      ) : (
        <div className="fixed top-16 left-4 z-40 w-96 max-w-[92vw] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl shadow-2xl glass bg-surface-light dark:bg-surface-dark border border-card-light dark:border-card-dark">
          {panelContent}
        </div>
      )}
    </div>
  )
}
