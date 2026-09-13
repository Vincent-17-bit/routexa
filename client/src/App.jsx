import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import MapContainer from './components/MapContainer'
import SearchPanel from './components/SearchPanel'
import RouteResults from './components/RouteResults'
import { TrafficToast, useTrafficFeed } from './components/TrafficToast'
import { useSheetState, SHEET_STATE } from './hooks/useSheetState'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useDebouncedCallback } from './hooks/useDebounce'
import { useSystemTheme } from './hooks/useSystemTheme'
import { checkHealth, reverseGeocode, fetchDirections } from './lib/api'

const EMPTY_POINT = { text: '', coords: null }

export default function App() {
  useSystemTheme()
  const isMobile = !useMediaQuery('(min-width: 640px)')
  const { state: sheetState, setState: setSheetState, reset: resetSheet, dragHandlers } = useSheetState()

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

  const requestIdRef = useRef(0)

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

  const handleSelectOrigin = useCallback((result) => {
    setOrigin({ text: result.text, coords: result.center })
    setMapFocus({ coords: result.center, bbox: result.bbox, ts: Date.now() })
  }, [])

  const handleSelectDestination = useCallback((result) => {
    setDestination({ text: result.text, coords: result.center })
    setMapFocus({ coords: result.center, bbox: result.bbox, ts: Date.now() })
  }, [])

  const pickTargetField = useMemo(() => {
    if (focusedField === 'destination') return 'destination'
    if (focusedField === 'origin') return 'origin'
    return origin.coords ? 'destination' : 'origin'
  }, [focusedField, origin.coords])

  const handleMapPick = useCallback(async (field, coords, presetName) => {
    const result = presetName
      ? { text: presetName, coords }
      : await reverseGeocode(coords[0], coords[1]).catch(() => ({ text: `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`, coords }))
    if (field === 'origin') setOrigin(result)
    else setDestination(result)
    setFocusedField(null)
  }, [])

  const handleReverse = useCallback(() => {
    const prevOrigin = origin
    const prevDestination = destination
    setOrigin(prevDestination)
    setDestination(prevOrigin)
    if (routeDrawn && prevDestination.coords && prevOrigin.coords) {
      setRoutes([])
      debouncedRecompute(prevDestination.coords, prevOrigin.coords, mode)
    }
  }, [origin, destination, routeDrawn, mode, debouncedRecompute])

  const handleShowRoute = useCallback(async () => {
    await computeRoute(origin.coords, destination.coords, mode)
    setSheetState((s) => Math.max(s, SHEET_STATE.PREVIEW))
  }, [origin.coords, destination.coords, mode, computeRoute, setSheetState])

  const handleCancel = useCallback(() => {
    requestIdRef.current++
    setOrigin(EMPTY_POINT)
    setDestination(EMPTY_POINT)
    setFocusedField(null)
    setRoutes([])
    setActiveRouteId(null)
    setRouteDrawn(false)
    setRouteError(null)
    resetSheet()
  }, [resetSheet])

  const handleFocusInput = useCallback(() => {
    setSheetState((s) => Math.max(s, SHEET_STATE.PREVIEW))
  }, [setSheetState])

  const canShowRoute = Boolean(origin.coords && destination.coords) && !routeLoading
  const activeRoute = routes.find((r) => r.id === activeRouteId)
  const { current: toastMessage, feed } = useTrafficFeed(routeDrawn ? activeRoute?.segments : null)

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
        compact={isMobile && sheetState === SHEET_STATE.IDLE}
      />
      {routeError && (!isMobile || sheetState >= SHEET_STATE.PREVIEW) && (
        <p className="px-4 pb-2 text-xs text-rose-600 dark:text-rose-400">{routeError}</p>
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
          <div className="flex-1 overflow-hidden">{panelContent}</div>
        </div>
      ) : (
        <div className="fixed top-16 left-4 z-40 w-96 max-w-[92vw] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl shadow-2xl glass bg-surface-light dark:bg-surface-dark border border-card-light dark:border-card-dark">
          {panelContent}
        </div>
      )}
    </div>
  )
}
