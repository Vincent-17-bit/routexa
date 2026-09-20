export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_API_SECRET || ''

function authHeaders() {
  return ADMIN_SECRET ? { Authorization: `Bearer ${ADMIN_SECRET}` } : {}
}

export async function checkHealth() {
  const res = await fetch(`${API_URL}/api/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

async function get(path, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString()
  const res = await fetch(`${API_URL}${path}${qs ? `?${qs}` : ''}`, { headers: authHeaders() })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `${path} failed: ${res.status}`)
  }
  return res.json()
}

async function patch(path) {
  const res = await fetch(`${API_URL}${path}`, { method: 'PATCH', headers: authHeaders() })
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return res.json()
}

export const getOverview = () => get('/api/devices/overview')
export const getDevices = (params) => get('/api/devices', params)
export const getDevice = (id) => get(`/api/devices/${id}`)

export const getLogs = (type, params) => get(`/api/logs/${type}`, params)
export const getDeletedLogs = (type, params) => get(`/api/logs/${type}/deleted`, params)
export const softDeleteLog = (type, id) => patch(`/api/logs/${type}/${id}/delete`)
export const restoreLog = (type, id) => patch(`/api/logs/${type}/${id}/restore`)

export async function exportLogs(type, params, format) {
  const qs = new URLSearchParams({ ...params, format }).toString()
  const res = await fetch(`${API_URL}/api/logs/${type}/export?${qs}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`export failed: ${res.status}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${type}_logs.${format}`
  a.click()
  URL.revokeObjectURL(url)
}
