import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_TOKEN } from '../lib/api'
import { KNOWN_MAKI_IDS, buildMakiMatchExpression } from '../lib/poiCategories'

mapboxgl.accessToken = MAPBOX_TOKEN

const NAIROBI_CENTER = [36.8219, -1.2921]
const EMPTY_FC = { type: 'FeatureCollection', features: [] }
const DEFAULT_POI_COLOR = '#64748B'

function pinEl(color) {
  const el = document.createElement('div')
  el.innerHTML = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`
  return el.firstElementChild
}

export default function MapContainer({ origin, destination, routes, activeRouteId, pickTargetField, onMapPick, mapFocus }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const loadedRef = useRef(false)
  const originMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const pickTargetRef = useRef(pickTargetField)

  useEffect(() => {
    pickTargetRef.current = pickTargetField
  }, [pickTargetField])

  useEffect(() => {
    if (mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: NAIROBI_CENTER,
      zoom: 13,
      attributionControl: false
    })

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
        const knownMakiList = Array.from(KNOWN_MAKI_IDS)
        map.addLayer({
          id: 'poi-halo',
          type: 'circle',
          source: 'composite',
          'source-layer': 'poi_label',
          filter: ['in', ['get', 'maki'], ['literal', knownMakiList]],
          paint: {
            'circle-radius': 9,
            'circle-color': buildMakiMatchExpression(DEFAULT_POI_COLOR),
            'circle-opacity': 0.16,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': buildMakiMatchExpression(DEFAULT_POI_COLOR),
            'circle-stroke-opacity': 0.55
          }
        }, 'poi-label')

        map.setLayerZoomRange('poi-label', 0, 24)
        map.setPaintProperty('poi-label', 'icon-color', buildMakiMatchExpression(DEFAULT_POI_COLOR))
        map.setLayoutProperty('poi-label', 'icon-size', ['interpolate', ['linear'], ['zoom'], 10, 0.85, 14, 1.25, 18, 1.6])
        map.setLayoutProperty('poi-label', 'icon-allow-overlap', true)
        map.setLayoutProperty('poi-label', 'icon-ignore-placement', true)
        map.setLayoutProperty('poi-label', 'text-optional', true)
        map.setLayoutProperty('poi-label', 'text-size', 12)
        map.setPaintProperty('poi-label', 'text-halo-width', 1.4)
      }

      loadedRef.current = true
    })

    map.on('click', (e) => {
      const target = pickTargetRef.current
      const poiFeatures = map.queryRenderedFeatures(e.point, { layers: ['poi-label'] })
      const poi = poiFeatures.find((f) => f.properties?.name)
      if (poi) {
        onMapPick(target, poi.geometry.coordinates, poi.properties.name)
        return
      }
      onMapPick(target, [e.lngLat.lng, e.lngLat.lat])
    })

    map.on('mouseenter', 'poi-label', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'poi-label', () => { map.getCanvas().style.cursor = 'grab' })
    map.on('dragstart', () => { map.getCanvas().style.cursor = 'grabbing' })
    map.on('dragend', () => { map.getCanvas().style.cursor = 'grab' })

    mapRef.current = map
    return () => map.remove()
  }, [onMapPick])

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
