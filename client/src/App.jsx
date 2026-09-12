import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import MapContainer from './components/MapContainer'
import SearchPanel from './components/SearchPanel'
import RouteResults from './components/RouteResults'
import { useSheetState, SHEET_STATE } from './hooks/useSheetState'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useDebouncedCallback } from './hooks/useDebounce'
import { checkHealth, forwardGeocode, reverseGeocode, fetchDirections } from './lib/api'

const EMPTY_POINT = { text: '', coords: null }

export default function App() {
  const isMobile = !useMediaQuery('(min-width: 640px)')
  const { state: sheetState, setState: setSheetState, reset: resetSheet, dragHandlers } = useSheetState()

  const [origin, setOrigin] = useState(EMPTY_POINT)
  const [destination, setDestination] = useState(EMPTY_POINT)
  const [mode, setMode] = useState('car')
  const [pickingField, setPickingField] = useState(null)

  const [routes, setRoutes] = useState([])
  const [activeRouteId, setActiveRouteId] = useState(null)
  const [routeDrawn, setRouteDrawn] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState(null)

  const requestIdRef = useRef(0)

  useEffect(() => {
    checkHealth()
      .then(() => console.info('[routexa] server reachable'))
      .catch((err) => console.warn('[routexa] server unreachable:', err.message))
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

  const geocodeField = useDebouncedCallback(async (field, text) => {
    if (!text.trim()) return
    const result = await forwardGeocode(text).catch(() => null)
    if (!result) return
    if (field === 'origin') setOrigin((o) => (o.text === text ? { text: o.text, coords: result.coords } : o))
    else setDestination((d) => (d.text === text ? { text: d.text, coords: result.coords } : d))
  }, 400)

  const handleOriginChange = useCallback((text) => {
    setOrigin({ text, coords: null })
    geocodeField('origin', text)
  }, [geocodeField])

  const handleDestinationChange = useCallback((text) => {
    setDestination({ text, coords: null })
    geocodeField('destination', text)
  }, [geocodeField])

  const handleTogglePick = useCallback((field) => {
    setPickingField((current) => (current === field ? null : field))
  }, [])

  const handleMapPick = useCallback(async (field, coords) => {
    setPickingField(null)
    const result = await reverseGeocode(coords[0], coords[1]).catch(() => ({ text: `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`, coords }))
    if (field === 'origin') setOrigin(result)
    else setDestination(result)
  }, [])

  const handleReverse = useCallback(() => {
    const prevOrigin = origin
    const prevDestination = destination
    setOrigin(prevDestination)
    setDestination(prevOrigin)
    if (routeDrawn && prevDestination.coords && prevOrigin.coords) {
      debouncedRecompute(prevDestination.coords, prevOrigin.coords, mode)
    }
  }, [origin, destination, routeDrawn, mode, debouncedRecompute])

  const handleShowRoute = useCallback(() => {
    computeRoute(origin.coords, destination.coords, mode)
  }, [origin.coords, destination.coords, mode, computeRoute])

  const handleCancel = useCallback(() => {
    requestIdRef.current++
    setOrigin(EMPTY_POINT)
    setDestination(EMPTY_POINT)
    setPickingField(null)
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

  const panelContent = (
    <>
      <SearchPanel
        origin={origin}
        destination={destination}
        onOriginChange={handleOriginChange}
        onDestinationChange={handleDestinationChange}
        onReverse={handleReverse}
        onCancel={handleCancel}
        onFocusInput={handleFocusInput}
        mode={mode}
        onModeChange={setMode}
        pickingField={pickingField}
        onTogglePick={handleTogglePick}
        canShowRoute={canShowRoute}
        onShowRoute={handleShowRoute}
        routeLoading={routeLoading}
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
        pickingField={pickingField}
        onMapPick={handleMapPick}
      />

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
        <div className="fixed top-16 left-4 z-40 w-96 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl shadow-2xl glass bg-surface-light dark:bg-surface-dark border border-card-light dark:border-card-dark">
          {panelContent}
        </div>
      )}
    </div>
  )
}
