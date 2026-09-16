const PRIVATE_IP = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|fc00:|fe80:)/

export async function lookupGeo(ip) {
  if (!ip || PRIVATE_IP.test(ip)) return { city: null, country: null }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return { city: null, country: null }
    const data = await res.json()
    if (!data.success) return { city: null, country: null }
    return { city: data.city || null, country: data.country || null }
  } catch {
    return { city: null, country: null }
  }
}
