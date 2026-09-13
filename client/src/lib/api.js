export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const DIRECTIONS_PROFILE = { car: 'driving-traffic', transit: 'driving', motorbike: 'driving' }
const SEARCH_TYPES = 'country,region,postcode,district,place,locality,neighborhood,address,poi'
const REVERSE_TYPES = 'address,poi,neighborhood,locality,place,district'

export async function checkHealth() {
  const res = await fetch(`${API_URL}/api/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

export async function searchPlaces(query, proximity) {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    autocomplete: 'true',
    fuzzyMatch: 'true',
    limit: '8',
    types: SEARCH_TYPES
  })
  if (proximity) params.set('proximity', `${proximity[0]},${proximity[1]}`)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  const data = await res.json()
  return (data.features || []).map((f) => ({
    id: f.id,
    text: f.text,
    context: (f.context || []).map((c) => c.text).join(', '),
    center: f.center,
    bbox: f.bbox || null
  }))
}

export async function reverseGeocode(lng, lat) {
  const params = new URLSearchParams({ access_token: MAPBOX_TOKEN, limit: '1', types: REVERSE_TYPES })
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`)
  const data = await res.json()
  const feature = data.features?.[0]
  return {
    text: feature?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    coords: feature?.center || [lng, lat]
  }
}

async function nameUnnamedSegment(segment) {
  const coords = segment.geometry?.coordinates
  if (!coords?.length) return segment
  const [lng, lat] = coords[Math.floor(coords.length / 2)]
  try {
    const result = await reverseGeocode(lng, lat)
    const label = result.text.split(',')[0].trim()
    if (label) return { ...segment, name: label }
  } catch {
    // keep the maneuver-instruction fallback name on failure
  }
  return segment
}

export async function fetchDirections(originCoords, destCoords, mode) {
  const profile = DIRECTIONS_PROFILE[mode] || 'driving-traffic'
  const coordStr = `${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}`
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordStr}?alternatives=true&geometries=geojson&steps=true&overview=full&access_token=${MAPBOX_TOKEN}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Directions failed: ${res.status}`)
  const data = await res.json()
  if (!data.routes?.length) throw new Error('No route found')

  const routes = data.routes.map((route, i) => {
    const leg = route.legs[0]
    const distanceKm = route.distance / 1000
    const durationMin = route.duration / 60
    const speedKmh = route.duration > 0 ? distanceKm / (route.duration / 3600) : 0
    const segments = leg.steps
      .filter((s) => s.distance > 0)
      .map((s) => {
        const hasName = Boolean(s.name && s.name.trim())
        return {
          name: hasName ? s.name : s.maneuver.instruction,
          unnamed: !hasName,
          distanceKm: s.distance / 1000,
          durationMin: s.duration / 60,
          speedKmh: s.duration > 0 ? (s.distance / 1000) / (s.duration / 3600) : speedKmh,
          geometry: s.geometry
        }
      })
    return {
      id: `route-${i}`,
      via: leg.summary || 'Direct route',
      durationMin: Math.round(durationMin),
      distanceKm,
      speedKmh,
      geometry: route.geometry,
      segments
    }
  })

  await Promise.all(
    routes.flatMap((r) =>
      r.segments.map(async (s, i) => {
        if (!s.unnamed) return
        r.segments[i] = await nameUnnamedSegment(s)
      })
    )
  )
  routes.forEach((r) => r.segments.forEach((s) => delete s.unnamed))

  return routes
}
