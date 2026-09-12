import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_TOKEN } from '../lib/api'
import { KNOWN_MAKI_IDS, MAKI_TO_CATEGORY } from '../lib/poiCategories'

mapboxgl.accessToken = MAPBOX_TOKEN

const NAIROBI_CENTER = [36.8219, -1.2921]
const EMPTY_FC = { type: 'FeatureCollection', features: [] }
const MAX_POI_MARKERS = 150

function pinEl(color) {
  const el = document.createElement('div')
  el.innerHTML = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`
  return el.firstElementChild
}

function poiPinEl(category) {
  const el = document.createElement('div')
  el.style.width = '22px'
  el.style.height = '28px'
  el.style.position = 'relative'
  el.style.cursor = 'pointer'
  el.innerHTML = `
    <svg width="22" height="28" viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;">
      <path d="M11 0C4.9 0 0 4.9 0 11c0 7.7 11 17 11 17s11-9.3 11-17C22 4.9 17.1 0 11 0z" fill="${category.color}" stroke="white" stroke-width="1"/>
    </svg>
    <i class="fas ${category.fa}" style="position:absolute;top:4px;left:0;width:22px;text-align:center;color:#fff;font-size:9px;line-height:1;"></i>
  `
  return el
}

export default function MapContainer({ origin, destination, routes, activeRouteId, pickTargetField, onMapPick, mapFocus }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const loadedRef = useRef(false)
  const originMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const pickTargetRef = useRef(pickTargetField)
  const onMapPickRef = useRef(onMapPick)
  const poiMarkersRef = useRef(new Map())

  useEffect(() => {
    pickTargetRef.current = pickTargetField
  }, [pickTargetField])

  useEffect(() => {
    onMapPickRef.current = onMapPick
  }, [onMapPick])

  useEffect(() => {
    if (mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
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
          const el = poiPinEl(category)
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

    map.on('load', () => {
      map.setPaintProperty('background', 'background-color', '#EBF6EE')
      map.getCanvas().style.cursor = 'grab'

      map.addSource('route-alts', { type: 'geojson', data: EMPTY_FC })
      map.addLayer({
        id: 'route-alts-layer',
        type: 'line',
        source: 'route-alts',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#9CA3AF', 'line-width': 5, 'line-opacity': 0.6 }
      })

      map.addSource('route-active', { type: 'geojson', data: EMPTY_FC })
      map.addLayer({
        id: 'route-active-layer',
        type: 'line',
        source: 'route-active',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#2563EB', 'line-width': 7 }
      })

      map.addSource('mapbox-traffic', { type: 'vector', url: 'mapbox://mapbox.mapbox-traffic-v1' })
      map.addLayer({
        id: 'traffic-layer',
        type: 'line',
        source: 'mapbox-traffic',
        'source-layer': 'traffic',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 16, 4],
          'line-color': [
            'match',
            ['get', 'congestion'],
            'low', '#059669',
            'moderate', '#D97706',
            'heavy', '#DC2626',
            'severe', '#DC2626',
            '#059669'
          ]
        }
      })

      if (map.getLayer('poi-label')) {
        const existingFilter = map.getFilter('poi-label')
        const hideMatched = ['!', ['in', ['get', 'maki'], ['literal', KNOWN_MAKI_IDS]]]
        map.setFilter('poi-label', existingFilter ? ['all', existingFilter, hideMatched] : hideMatched)
      }

      loadedRef.current = true
      refreshPOIMarkers()
    })

    map.on('idle', refreshPOIMarkers)

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
      originMarkerRef.current = new mapboxgl.Marker({ element: pinEl('#2563EB'), anchor: 'bottom' })
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
      destMarkerRef.current = new mapboxgl.Marker({ element: pinEl('#DC2626'), anchor: 'bottom' })
    }
    destMarkerRef.current.setLngLat(destination.coords).addTo(mapRef.current)
  }, [destination?.coords])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return

    const active = routes.find((r) => r.id === activeRouteId)
    const alts = routes.filter((r) => r.id !== activeRouteId)

    map.getSource('route-active')?.setData(
      active ? { type: 'Feature', geometry: active.geometry } : EMPTY_FC
    )
    map.getSource('route-alts')?.setData({
      type: 'FeatureCollection',
      features: alts.map((r) => ({ type: 'Feature', geometry: r.geometry }))
    })

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
