import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const NAIROBI_CENTER = [36.8219, -1.2921]

export default function MapContainer() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: NAIROBI_CENTER,
      zoom: 12,
      attributionControl: false
    })

    map.on('load', () => {
      map.setPaintProperty('background', 'background-color', '#EBF6EE')
      map.getCanvas().style.cursor = 'grab'
    })

    map.on('mouseenter', 'poi-label', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'poi-label', () => { map.getCanvas().style.cursor = 'grab' })
    map.on('dragstart', () => { map.getCanvas().style.cursor = 'grabbing' })
    map.on('dragend', () => { map.getCanvas().style.cursor = 'grab' })

    mapRef.current = map
    return () => map.remove()
  }, [])

  const zoomBy = (delta) => mapRef.current?.zoomTo(mapRef.current.getZoom() + delta)

  return (
    <div className="absolute inset-0 z-0">
      <div ref={containerRef} className="w-full h-full" />

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
