import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_TOKEN } from '../lib/api'
import { KNOWN_MAKI_IDS, MAKI_TO_CATEGORY } from '../lib/poiCategories'
import { resolveTrafficStatus, TRAFFIC_STATUS, TRAFFIC_HEX } from '../lib/trafficStatus'

mapboxgl.accessToken = MAPBOX_TOKEN

const NAIROBI_CENTER = [36.8219, -1.2921]
const EMPTY_FC = { type: 'FeatureCollection', features: [] }
const MAX_POI_MARKERS = 150
const LIGHT_STYLE = 'mapbox://styles/mapbox/light-v11'
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11'
const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)')

// same traffic.* colors as the badges/toasts, picked for the active map mode
function routeStatusColorExpr(isDark) {
  const mode = isDark ? 'dark' : 'light'
  const clear = TRAFFIC_HEX[TRAFFIC_STATUS.CLEAR][mode]
  return [
    'match', ['get', 'status'],
    TRAFFIC_STATUS.HEAVY, TRAFFIC_HEX[TRAFFIC_STATUS.HEAVY][mode],
    TRAFFIC_STATUS.MODERATE, TRAFFIC_HEX[TRAFFIC_STATUS.MODERATE][mode],
    TRAFFIC_STATUS.CLEAR, clear,
    clear
  ]
}

function styleLightBasemap(map) {
  const setIfExists = (id, prop, value) => { if (map.getLayer(id)) map.setPaintProperty(id, prop, value) }
  const setLayoutIfExists = (id, prop, value) => { if (map.getLayer(id)) map.setLayoutProperty(id, prop, value) }

  setIfExists('water', 'fill-color', '#C6ECFF')
  setIfExists('national-park', 'fill-color', '#D2F1D2')
  setIfExists('landcover', 'fill-color', '#DCFCE7')
  setIfExists('landuse', 'fill-color', '#E4F2E6')

  setIfExists('road-motorway-trunk', 'line-color', '#C7CCD6')
  setIfExists('road-primary', 'line-color', '#D1D5DB')
  setIfExists('road-secondary-tertiary', 'line-color', '#E2E8F0')
  setIfExists('road-street', 'line-color', '#FFFFFF')
  setIfExists('road-minor', 'line-color', '#FFFFFF')
  setIfExists('road-local', 'line-color', '#FFFFFF')

  for (const id of ['road-street', 'road-minor', 'road-local']) {
    setLayoutIfExists(id, 'line-width', ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 6])
  }

  for (const id of ['road-label', 'road-label-simple']) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'text-size', 11)
      map.setPaintProperty(id, 'text-color', '#5F6368')
      map.setPaintProperty(id, 'text-halo-color', '#FFFFFF')
      map.setPaintProperty(id, 'text-halo-width', 2)
    }
  }
}

// dark-v11 default label color is too dim to read on the near-black bg —
// walk every text layer in the loaded style instead of guessing ids, so nothing gets missed
function styleDarkBasemap(map) {
  const layers = map.getStyle()?.layers || []
  for (const layer of layers) {
    if (layer.type !== 'symbol') continue
    if (!layer.layout?.['text-field']) continue
    map.setPaintProperty(layer.id, 'text-color', '#FFFFFF')
    map.setPaintProperty(layer.id, 'text-halo-color', '#0F172A')
    map.setPaintProperty(layer.id, 'text-halo-width', 1.4)
    const size = map.getLayoutProperty(layer.id, 'text-size')
    if (typeof size === 'number' && size < 12) {
      map.setLayoutProperty(layer.id, 'text-size', 12)
    }
  }
}

// mirrors route.active / route.destination in tailwind.config.js — Mapbox
// markers are plain DOM nodes but still need a literal hex, not a class
const PIN_HEX = {
  origin: { light: '#0D9488', dark: '#14B8A6' },
  destination: { light: '#DB2777', dark: '#F472B6' }
}
const ROUTE_ALT_HEX = { light: '#9CA3AF', dark: '#64748B' }
const LIVE_MARKER_RGB = { light: '13,148,136', dark: '20,184,166' }

function pinColor(kind, isDark) {
  return PIN_HEX[kind][isDark ? 'dark' : 'light']
}

function setPinFill(marker, color) {
  marker?.getElement()?.querySelector('path')?.setAttribute('fill', color)
}

function setLiveMarkerColor(el, isDark) {
  if (!el) return
  const rgb = LIVE_MARKER_RGB[isDark ? 'dark' : 'light']
  el.style.background = `rgb(${rgb})`
  el.style.boxShadow = `0 0 0 6px rgba(${rgb},0.25)`
}

function pinEl(color) {
  const el = document.createElement('div')
  el.innerHTML = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`
  return el.firstElementChild
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
}

function poiPinEl(category, name) {
  const el = document.createElement('div')
  el.style.width = '30px'
  el.style.height = '38px'
  el.style.position = 'relative'
  el.style.cursor = 'pointer'
  el.innerHTML = `
    <div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);max-width:110px;">
      <span class="text-[10px] font-medium leading-tight px-1.5 py-0.5 rounded-md shadow-sm bg-white/95 dark:bg-slate-900/90 text-text-primary-light dark:text-text-primary-dark border border-card-light dark:border-card-dark block truncate">${escapeHtml(name)}</span>
    </div>
    <svg width="30" height="38" viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;">
      <path d="M11 0C4.9 0 0 4.9 0 11c0 7.7 11 17 11 17s11-9.3 11-17C22 4.9 17.1 0 11 0z" fill="${category.color}" stroke="white" stroke-width="1"/>
    </svg>
    <i class="fas ${category.fa}" style="position:absolute;top:6px;left:0;width:30px;text-align:center;color:#fff;font-size:11px;line-height:1;"></i>
  `
  return el
}

export default function MapContainer({ origin, destination, routes, activeRouteId, pickTargetField, onMapPick, mapFocus, livePosition, distanceFromRouteKm }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const loadedRef = useRef(false)
  const originMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const liveMarkerRef = useRef(null)
  const pickTargetRef = useRef(pickTargetField)
  const onMapPickRef = useRef(onMapPick)
  const poiMarkersRef = useRef(new Map())
  const routesRef = useRef(routes)
  const activeRouteIdRef = useRef(activeRouteId)
  const applyRouteDataRef = useRef(() => {})

  useEffect(() => {
    pickTargetRef.current = pickTargetField
  }, [pickTargetField])

  useEffect(() => {
    onMapPickRef.current = onMapPick
  }, [onMapPick])

  useEffect(() => {
    if (mapRef.current) return

    const isDark = prefersDarkQuery.matches
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: isDark ? DARK_STYLE : LIGHT_STYLE,
      center: NAIROBI_CENTER,
      zoom: 13,
      attributionControl: false
    })

    const refreshPOIMarkers = () => {
      if (!loadedRef.current) return
      const features = map.querySourceFeatures('composite', {
        sourceLayer: 'poi_label',
        filter: ['in', ['get', 'maki'], ['literal', KNOWN_MAKI_IDS]]
      })

      const seen = new Set()
      for (const f of features) {
        if (seen.size >= MAX_POI_MARKERS) break
        const category = MAKI_TO_CATEGORY[f.properties?.maki]
        if (!category) continue
        const [lng, lat] = f.geometry.coordinates
        const key = `${category.id}:${lng.toFixed(5)}:${lat.toFixed(5)}`
        if (seen.has(key)) continue
        seen.add(key)

        if (!poiMarkersRef.current.has(key)) {
          const name = f.properties?.name || category.label
          const el = poiPinEl(category, name)
          el.title = name
          el.addEventListener('click', (ev) => {
            ev.stopPropagation()
            onMapPickRef.current(pickTargetRef.current, [lng, lat], name)
          })
          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map)
          poiMarkersRef.current.set(key, marker)
        }
      }

      for (const [key, marker] of poiMarkersRef.current) {
        if (!seen.has(key)) {
          marker.remove()
          poiMarkersRef.current.delete(key)
        }
      }
    }

    const applyRouteData = () => {
      if (!loadedRef.current) return
      const currentRoutes = routesRef.current
      const currentActiveId = activeRouteIdRef.current
      const active = currentRoutes.find((r) => r.id === currentActiveId)
      const alts = currentRoutes.filter((r) => r.id !== currentActiveId)

      const activeSegments = (active?.segments || [])
        .filter((s) => s.geometry)
        .map((s) => ({
          type: 'Feature',
          properties: { status: resolveTrafficStatus(s.speedKmh) },
          geometry: s.geometry
        }))
      map.getSource('route-active')?.setData(
        activeSegments.length
          ? { type: 'FeatureCollection', features: activeSegments }
          : active
            ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { status: resolveTrafficStatus(active.speedKmh) }, geometry: active.geometry }] }
            : EMPTY_FC
      )
      map.getSource('route-alts')?.setData({
        type: 'FeatureCollection',
        features: alts.map((r) => ({ type: 'Feature', geometry: r.geometry }))
      })
    }
    applyRouteDataRef.current = applyRouteData

    const setupStyleLayers = () => {
      loadedRef.current = false
      map.setPaintProperty('background', 'background-color', prefersDarkQuery.matches ? '#0F172A' : '#F5F5F5')
      map.getCanvas().style.cursor = 'grab'

      map.addSource('route-alts', { type: 'geojson', data: EMPTY_FC })
      map.addLayer({
        id: 'route-alts-layer',
        type: 'line',
        source: 'route-alts',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ROUTE_ALT_HEX[prefersDarkQuery.matches ? 'dark' : 'light'], 'line-width': 5, 'line-opacity': 0.6 }
      })

      map.addSource('route-active', { type: 'geojson', data: EMPTY_FC })
      map.addLayer({
        id: 'route-active-layer',
        type: 'line',
        source: 'route-active',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': routeStatusColorExpr(prefersDarkQuery.matches), 'line-width': 7 }
      })

      if (prefersDarkQuery.matches) {
        styleDarkBasemap(map)
      } else {
        styleLightBasemap(map)
      }

      if (map.getLayer('poi-label')) {
        const existingFilter = map.getFilter('poi-label')
        const hideMatched = ['!', ['in', ['get', 'maki'], ['literal', KNOWN_MAKI_IDS]]]
        map.setFilter('poi-label', existingFilter ? ['all', existingFilter, hideMatched] : hideMatched)
      }

      loadedRef.current = true
      applyRouteDataRef.current()
      refreshPOIMarkers()
    }

    map.on('style.load', setupStyleLayers)
    map.on('idle', refreshPOIMarkers)
    map.on('moveend', refreshPOIMarkers)

    const handleThemeChange = (e) => {
      map.setStyle(e.matches ? DARK_STYLE : LIGHT_STYLE)
      setPinFill(originMarkerRef.current, pinColor('origin', e.matches))
      setPinFill(destMarkerRef.current, pinColor('destination', e.matches))
      setLiveMarkerColor(liveMarkerRef.current?.getElement(), e.matches)
    }
    prefersDarkQuery.addEventListener('change', handleThemeChange)

    map.on('click', (e) => {
      const target = pickTargetRef.current
      const poiFeatures = map.queryRenderedFeatures(e.point, { layers: ['poi-label'] })
      const poi = poiFeatures.find((f) => f.properties?.name)
      if (poi) {
        onMapPickRef.current(target, poi.geometry.coordinates, poi.properties.name)
        return
      }
      onMapPickRef.current(target, [e.lngLat.lng, e.lngLat.lat])
    })

    map.on('mouseenter', 'poi-label', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'poi-label', () => { map.getCanvas().style.cursor = 'grab' })
    map.on('dragstart', () => { map.getCanvas().style.cursor = 'grabbing' })
    map.on('dragend', () => { map.getCanvas().style.cursor = 'grab' })

    mapRef.current = map
    return () => {
      prefersDarkQuery.removeEventListener('change', handleThemeChange)
      for (const marker of poiMarkersRef.current.values()) marker.remove()
      poiMarkersRef.current.clear()
      map.remove()
    }
  }, [])

  useEffect(() => {
    if (!origin?.coords) {
      originMarkerRef.current?.remove()
      originMarkerRef.current = null
      return
    }
    if (!originMarkerRef.current) {
      originMarkerRef.current = new mapboxgl.Marker({ element: pinEl(pinColor('origin', prefersDarkQuery.matches)), anchor: 'bottom' })
    }
    originMarkerRef.current.setLngLat(origin.coords).addTo(mapRef.current)
  }, [origin?.coords])

  useEffect(() => {
    if (!destination?.coords) {
      destMarkerRef.current?.remove()
      destMarkerRef.current = null
      return
    }
    if (!destMarkerRef.current) {
      destMarkerRef.current = new mapboxgl.Marker({ element: pinEl(pinColor('destination', prefersDarkQuery.matches)), anchor: 'bottom' })
    }
    destMarkerRef.current.setLngLat(destination.coords).addTo(mapRef.current)
  }, [destination?.coords])

  useEffect(() => {
    const map = mapRef.current
    if (!livePosition) {
      liveMarkerRef.current?.remove()
      liveMarkerRef.current = null
      return
    }
    if (!liveMarkerRef.current) {
      const el = document.createElement('div')
      el.style.width = '18px'
      el.style.height = '18px'
      el.style.borderRadius = '50%'
      el.style.border = '3px solid white'
      setLiveMarkerColor(el, prefersDarkQuery.matches)
      liveMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
    }
    liveMarkerRef.current.setLngLat(livePosition).addTo(map)
    if (distanceFromRouteKm == null || distanceFromRouteKm <= 3) {
      map?.easeTo({ center: livePosition, duration: 500 })
    }
  }, [livePosition, distanceFromRouteKm])

  useEffect(() => {
    routesRef.current = routes
    activeRouteIdRef.current = activeRouteId
    const map = mapRef.current
    if (!map || !loadedRef.current) return

    applyRouteDataRef.current()

    const active = routes.find((r) => r.id === activeRouteId)
    if (active?.geometry?.coordinates?.length) {
      const bounds = active.geometry.coordinates.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(active.geometry.coordinates[0], active.geometry.coordinates[0])
      )
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 600 })
    }
  }, [routes, activeRouteId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current || !mapFocus) return
    if (mapFocus.bbox) {
      map.fitBounds(
        [[mapFocus.bbox[0], mapFocus.bbox[1]], [mapFocus.bbox[2], mapFocus.bbox[3]]],
        { padding: 80, maxZoom: 16, duration: 800 }
      )
    } else if (mapFocus.coords) {
      map.flyTo({ center: mapFocus.coords, zoom: 15, duration: 800 })
    }
  }, [mapFocus])

  const zoomBy = (delta) => mapRef.current?.zoomTo(mapRef.current.getZoom() + delta)

  return (
    <div className="absolute inset-0 z-0">
      <div ref={containerRef} className="w-full h-full" />

      {pickTargetField && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full shadow-lg glass bg-surface-light dark:bg-surface-dark border border-card-light dark:border-card-dark text-sm font-medium">
          Tap the map to set {pickTargetField === 'origin' ? 'starting point' : 'destination'}
        </div>
      )}

      {routes.length > 0 && (
        <div
          className="fixed left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg glass bg-surface-light dark:bg-surface-dark border border-card-light dark:border-card-dark text-xs"
          style={{ bottom: 'calc(var(--sheet-height, 52px) + 16px)' }}
        >
          <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Live traffic</span>
          <span className="italic text-text-secondary-light dark:text-text-secondary-dark">Fast</span>
          <span className="flex items-center gap-0.5">
            <span className="w-3 h-1.5 rounded-sm bg-traffic-clear-light dark:bg-traffic-clear-dark" />
            <span className="w-3 h-1.5 rounded-sm bg-traffic-moderate-light dark:bg-traffic-moderate-dark" />
            <span className="w-3 h-1.5 rounded-sm bg-traffic-heavy-light dark:bg-traffic-heavy-dark" />
          </span>
          <span className="italic text-text-secondary-light dark:text-text-secondary-dark">Slow</span>
        </div>
      )}

      <div
        className="fixed right-4 z-40 flex flex-col rounded-lg overflow-hidden shadow-lg glass bg-surface-light dark:bg-surface-dark border border-card-light dark:border-card-dark"
        style={{ bottom: 'calc(var(--sheet-height, 52px) + 16px)' }}
      >
        <button
          onClick={() => zoomBy(1)}
          className="w-9 h-9 text-lg leading-none border-b border-card-light dark:border-card-dark hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => zoomBy(-1)}
          className="w-9 h-9 text-lg leading-none hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
    </div>
  )
}
