export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Mapbox has no dedicated transit/motorbike profile; both fall back to a driving profile.
const DIRECTIONS_PROFILE = { car: 'driving-traffic', transit: 'driving', motorbike: 'driving' }

export async function checkHealth() {
  const res = await fetch(`${API_URL}/api/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

export async function forwardGeocode(query) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1&proximity=36.8219,-1.2921`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocode failed: ${res.status}`)
  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null
  return { text: feature.place_name, coords: feature.center }
}

export async function reverseGeocode(lng, lat) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`)
  const data = await res.json()
  const feature = data.features?.[0]
  return { text: feature?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`, coords: [lng, lat] }
}

export async function fetchDirections(originCoords, destCoords, mode) {
  const profile = DIRECTIONS_PROFILE[mode] || 'driving-traffic'
  const coordStr = `${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}`
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordStr}?alternatives=true&geometries=geojson&steps=true&overview=full&annotations=speed&access_token=${MAPBOX_TOKEN}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Directions failed: ${res.status}`)
  const data = await res.json()
  if (!data.routes?.length) throw new Error('No route found')

  return data.routes.map((route, i) => {
    const leg = route.legs[0]
    const distanceKm = route.distance / 1000
    const durationMin = route.duration / 60
    const speedKmh = route.duration > 0 ? distanceKm / (route.duration / 3600) : 0
    return {
      id: `route-${i}`,
      via: leg.summary || 'Direct route',
      durationMin: Math.round(durationMin),
      distanceKm,
      speedKmh,
      geometry: route.geometry,
      steps: leg.steps.map((s) => s.maneuver.instruction).filter(Boolean)
    }
  })
}
