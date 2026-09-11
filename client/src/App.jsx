import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import MapContainer from './components/MapContainer'
import SearchPanel from './components/SearchPanel'
import RouteResults from './components/RouteResults'
import { useSheetState, SHEET_STATE } from './hooks/useSheetState'
import { useMediaQuery } from './hooks/useMediaQuery'
import { checkHealth } from './lib/api'

const MOCK_ROUTES = [
  {
    id: 'r1',
    via: 'Nairobi Expy',
    durationMin: 33,
    distanceKm: 20.0,
    speedKmh: 45,
    hasTolls: true,
    steps: ['Head south on Waiyaki Way', 'Merge onto Nairobi Expressway', 'Take exit toward Mombasa Rd', 'Arrive at destination']
  },
  {
    id: 'r2',
    via: 'Nakuru',
    durationMin: 48,
    distanceKm: 26.4,
    speedKmh: 22,
    hasTolls: false,
    steps: ['Head north on Ring Road', 'Continue onto Nakuru Highway', 'Arrive at destination']
  },
  {
    id: 'r3',
    via: 'Londiani',
    durationMin: 61,
    distanceKm: 31.1,
    speedKmh: 12,
    hasTolls: false,
    steps: ['Head west on Outer Ring Rd', 'Continue onto Londiani Rd', 'Arrive at destination']
  }
]

export default function App() {
  const isMobile = !useMediaQuery('(min-width: 640px)')
  const { state: sheetState, setState: setSheetState, reset: resetSheet, dragHandlers } = useSheetState()

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [mode, setMode] = useState('car')
  const [activeRouteId, setActiveRouteId] = useState(MOCK_ROUTES[0].id)

  useEffect(() => {
    checkHealth()
      .then(() => console.info('[trafiq] server reachable'))
      .catch((err) => console.warn('[trafiq] server unreachable:', err.message))
  }, [])

  const handleReverse = useCallback(() => {
    setOrigin(destination)
    setDestination(origin)
  }, [origin, destination])

  const handleCancel = useCallback(() => {
    setOrigin('')
    setDestination('')
    setActiveRouteId(MOCK_ROUTES[0].id)
    resetSheet()
  }, [resetSheet])

  const handleFocusInput = useCallback(() => {
    setSheetState((s) => Math.max(s, SHEET_STATE.PREVIEW))
  }, [setSheetState])

  const panelContent = (
    <>
      <SearchPanel
        origin={origin}
        destination={destination}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onReverse={handleReverse}
        onCancel={handleCancel}
        onFocusInput={handleFocusInput}
        mode={mode}
        onModeChange={setMode}
        compact={isMobile && sheetState === SHEET_STATE.IDLE}
      />
      {(!isMobile || sheetState >= SHEET_STATE.PREVIEW) && (
        <RouteResults
          routes={MOCK_ROUTES}
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
      <MapContainer />

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
