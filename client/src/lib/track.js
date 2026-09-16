import { API_URL } from './api'

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getDeviceId() {
  let id = localStorage.getItem('routexa:device_id')
  if (!id) {
    id = uuid()
    localStorage.setItem('routexa:device_id', id)
  }
  return id
}

export function getSessionId() {
  let id = sessionStorage.getItem('routexa:session_id')
  if (!id) {
    id = uuid()
    sessionStorage.setItem('routexa:session_id', id)
  }
  return id
}

function detectDeviceType() {
  const ua = navigator.userAgent
  if (/tablet|ipad/i.test(ua)) return 'Tablet'
  if (/mobi|android|iphone/i.test(ua)) return 'Mobile'
  if (/win|mac|linux/i.test(ua) && !/mobi/i.test(ua)) return 'PC'
  return 'Other'
}

function detectBrowser() {
  const ua = navigator.userAgent
  if (/edg\//i.test(ua)) return 'Edge'
  if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) return 'Chrome'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) return 'Safari'
  return 'Other'
}

function detectOs() {
  const ua = navigator.userAgent
  if (/windows/i.test(ua)) return 'Windows'
  if (/mac os/i.test(ua)) return 'macOS'
  if (/android/i.test(ua)) return 'Android'
  if (/iphone|ipad|ios/i.test(ua)) return 'iOS'
  if (/linux/i.test(ua)) return 'Linux'
  return 'Other'
}

function post(path, body) {
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then((res) => {
      if (!res.ok) console.warn(`[routexa] tracking ${path} failed: ${res.status}`)
      return res
    })
    .catch((err) => console.warn(`[routexa] tracking ${path} unreachable:`, err.message))
}

export function deviceIdentity() {
  return { device_id: getDeviceId(), fingerprint_hash: getDeviceId(), device_type: detectDeviceType(), browser: detectBrowser(), os: detectOs() }
}

export function trackDevice() {
  return post('/api/devices/track', deviceIdentity())
}

export function trackLogin() {
  return post('/api/logs/login', { ...deviceIdentity(), success: true })
}

export function trackSearch(queryText, { mode, resultCount, queryType } = {}) {
  if (!queryText?.trim()) return
  return post('/api/logs/search', {
    device_id: getDeviceId(),
    session_id: getSessionId(),
    query_text: queryText,
    query_type: queryType || null,
    mode: mode || null,
    result_count: resultCount ?? null
  })
}

export function trackRoute({ origin, destination, mode, distanceKm, etaMin, tollsDetected }) {
  return post('/api/logs/route', {
    device_id: getDeviceId(),
    origin,
    destination,
    mode,
    distance_km: distanceKm,
    eta_min: etaMin,
    tolls_detected: !!tollsDetected
  })
}

export function markOffline() {
  const url = `${API_URL}/api/devices/${getDeviceId()}/offline`
  if (navigator.sendBeacon) navigator.sendBeacon(url)
}
